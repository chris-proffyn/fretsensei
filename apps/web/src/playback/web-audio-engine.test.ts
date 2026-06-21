import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaybackNote } from '@fretsensei/utils';
import { createWebAudioPlaybackEngine } from './web-audio-engine';

const sampleSequence: PlaybackNote[] = [
  { midi: 60, noteName: 'C', stringIndex: 0, fret: 8, cellKey: '0-8' },
  { midi: 62, noteName: 'D', stringIndex: 0, fret: 10, cellKey: '0-10' },
  { midi: 64, noteName: 'E', stringIndex: 0, fret: 12, cellKey: '0-12' },
];

function createConnectableNode() {
  return {
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    Q: { value: 0, setValueAtTime: vi.fn() },
    gain: { value: 0 },
    type: 'lowpass',
  };
}

function createMockBufferSource() {
  return {
    buffer: null,
    onended: null as (() => void) | null,
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockAudioContext() {
  const bufferSources: ReturnType<typeof createMockBufferSource>[] = [];
  const oscillators: Array<{
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }> = [];

  const context = {
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createBuffer: vi.fn((_channels: number, length: number, rate: number) => {
      const channel = new Float32Array(length);

      return {
        length,
        sampleRate: rate,
        getChannelData: () => channel,
      };
    }),
    createBufferSource: vi.fn(() => {
      const source = createMockBufferSource();
      bufferSources.push(source);
      return source;
    }),
    createOscillator: vi.fn(() => {
      const oscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(oscillator);
      return oscillator;
    }),
    createGain: vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        value: 1,
      },
      connect: vi.fn().mockReturnThis(),
    })),
    createBiquadFilter: vi.fn(() => createConnectableNode()),
    createWaveShaper: vi.fn(() => ({
      curve: null,
      oversample: 'none',
      connect: vi.fn().mockReturnThis(),
    })),
    bufferSources,
    oscillators,
  };

  return context;
}

describe('createWebAudioPlaybackEngine', () => {
  let mockContext: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    mockContext = createMockAudioContext();
    vi.stubGlobal('AudioContext', vi.fn(() => mockContext));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses Karplus buffer sources by default', async () => {
    const engine = createWebAudioPlaybackEngine();

    await engine.playSequence(
      [sampleSequence[0]],
      { bpm: 60, subdivision: 1, repeat: false, direction: 'up' },
      {},
    );

    expect(mockContext.createBufferSource).toHaveBeenCalled();
    expect(mockContext.createBuffer).toHaveBeenCalled();
    expect(mockContext.createOscillator).toHaveBeenCalledTimes(4);
  });

  it('falls back to legacy synth when Karplus generation fails', async () => {
    mockContext.createBuffer.mockImplementationOnce(() => {
      throw new Error('buffer failed');
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const engine = createWebAudioPlaybackEngine();

    await engine.playSequence(
      [sampleSequence[0]],
      { bpm: 60, subdivision: 1, repeat: false, direction: 'up' },
      {},
    );

    expect(warnSpy).toHaveBeenCalled();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('schedules a one-bar count-in before the first sequence only', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = vi.fn();

    await engine.playSequence(
      [sampleSequence[0]],
      { bpm: 60, subdivision: 1, repeat: false, direction: 'up' },
      { onNoteStart },
    );

    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(onNoteStart).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3999);
    expect(onNoteStart).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onNoteStart).toHaveBeenCalledTimes(1);
  });

  it('does not count in again when repeat loops', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = vi.fn();

    await engine.playSequence(
      [sampleSequence[0]],
      { bpm: 60, subdivision: 1, repeat: true, direction: 'up' },
      { onNoteStart },
    );

    const oscillatorCallsAfterStart =
      mockContext.createOscillator.mock.calls.length;

    vi.advanceTimersByTime(5500);
    expect(onNoteStart).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(onNoteStart).toHaveBeenCalledTimes(2);
    expect(mockContext.createOscillator.mock.calls.length).toBe(
      oscillatorCallsAfterStart,
    );
  });

  it('cancels scheduled notes and active sources when stop is called', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = vi.fn();
    const onStopped = vi.fn();

    const sequence = sampleSequence;

    await engine.playSequence(
      sequence,
      { bpm: 60, subdivision: 1, repeat: false, direction: 'up' },
      { onNoteStart, onStopped },
    );

    expect(mockContext.bufferSources.length).toBeGreaterThan(0);

    engine.stop();

    mockContext.bufferSources.forEach((source) => {
      expect(source.stop).toHaveBeenCalled();
    });
    expect(onStopped).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10_000);

    expect(onNoteStart).not.toHaveBeenCalled();
  });
});
