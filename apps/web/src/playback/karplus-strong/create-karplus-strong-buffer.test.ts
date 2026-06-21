import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clampKarplusFrequency,
  createKarplusStrongBuffer,
  getKarplusDelayLength,
} from './create-karplus-strong-buffer';
import { KARPLUS_DEFAULTS } from './types';

function createMockAudioContext(sampleRate = 44100) {
  return {
    sampleRate,
    createBuffer: vi.fn((_channels: number, length: number, rate: number) => {
      const channel = new Float32Array(length);

      return {
        length,
        sampleRate: rate,
        numberOfChannels: 1,
        getChannelData: () => channel,
      };
    }),
  } as unknown as AudioContext;
}

describe('clampKarplusFrequency', () => {
  it('clamps frequencies below and above the safe range', () => {
    expect(clampKarplusFrequency(20)).toBe(KARPLUS_DEFAULTS.minFrequency);
    expect(clampKarplusFrequency(2000)).toBe(KARPLUS_DEFAULTS.maxFrequency);
    expect(clampKarplusFrequency(440)).toBe(440);
  });
});

describe('getKarplusDelayLength', () => {
  it('returns shorter delay buffers for higher frequencies', () => {
    expect(getKarplusDelayLength(44100, 110)).toBeGreaterThan(
      getKarplusDelayLength(44100, 880),
    );
  });
});

describe('createKarplusStrongBuffer', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a mono buffer with duration plus release length', () => {
    const context = createMockAudioContext();
    const buffer = createKarplusStrongBuffer(context, 440, {
      duration: 0.4,
      release: 0.1,
    });

    expect(context.createBuffer).toHaveBeenCalledWith(
      1,
      Math.ceil(0.5 * 44100),
      44100,
    );
    expect(buffer.length).toBe(Math.ceil(0.5 * 44100));
  });

  it('keeps generated samples finite and within normalised bounds', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0.75);

    const context = createMockAudioContext();
    const buffer = createKarplusStrongBuffer(context, 220);

    const samples = buffer.getChannelData(0);
    let peak = 0;

    samples.forEach((sample) => {
      expect(Number.isFinite(sample)).toBe(true);
      peak = Math.max(peak, Math.abs(sample));
    });

    expect(peak).toBeLessThanOrEqual(KARPLUS_DEFAULTS.normalisePeak + 0.001);
    expect(peak).toBeGreaterThan(0);
  });
});
