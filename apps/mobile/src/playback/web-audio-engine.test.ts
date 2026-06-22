import type { PlaybackNote } from '@fretsensei/utils';
import { createWebAudioPlaybackEngine } from './web-audio-engine';
import { resetSharedMobileAudioContextForTests } from './shared-mobile-audio-context';

const sampleSequence: PlaybackNote[] = [
  { midi: 60, noteName: 'C', stringIndex: 0, fret: 8, cellKey: '0-8' },
  { midi: 62, noteName: 'D', stringIndex: 0, fret: 10, cellKey: '0-10' },
];

const sampleOptions = {
  bpm: 90,
  subdivision: 1 as const,
  repeat: false,
  playbackDirection: 'up' as const,
};

describe('createWebAudioPlaybackEngine (mobile)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetSharedMobileAudioContextForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts playback after a prior stop', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = jest.fn();

    engine.stop();
    await engine.playSequence(sampleSequence, sampleOptions, {
      onNoteStart,
    });

    jest.advanceTimersByTime(5000);

    expect(onNoteStart).toHaveBeenCalled();
  });

  it('schedules note callbacks for a valid sequence', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = jest.fn();
    const onStopped = jest.fn();

    await engine.playSequence(sampleSequence, sampleOptions, {
      onNoteStart,
      onStopped,
    });

    jest.advanceTimersByTime(5000);
    engine.stop();

    expect(onNoteStart).toHaveBeenCalled();
    expect(onStopped).toHaveBeenCalled();
  });

  it('aborts an in-flight start when stop is called before scheduling', async () => {
    const engine = createWebAudioPlaybackEngine();
    const onNoteStart = jest.fn();

    const playPromise = engine.playSequence(sampleSequence, sampleOptions, {
      onNoteStart,
    });
    engine.stop();
    await playPromise;
    jest.runOnlyPendingTimers();

    expect(onNoteStart).not.toHaveBeenCalled();
  });
});
