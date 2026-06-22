import { buildVampDyad } from '@fretsensei/utils';
import {
  createMobileVampEngine,
  resetMobileVampBufferCacheForTests,
} from './mobile-vamp-engine';
import { createWebAudioPlaybackEngine } from './web-audio-engine';
import {
  getSharedMobileAudioContext,
  resetSharedMobileAudioContextForTests,
} from './shared-mobile-audio-context';

describe('createMobileVampEngine', () => {
  const dyad = buildVampDyad({ root: 'A', displayLabel: 'A' });

  beforeEach(() => {
    jest.useFakeTimers();
    resetSharedMobileAudioContextForTests();
    resetMobileVampBufferCacheForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
    resetSharedMobileAudioContextForTests();
    resetMobileVampBufferCacheForTests();
  });

  it('shares the mobile audio context with playback', async () => {
    const playbackEngine = createWebAudioPlaybackEngine();
    const vampEngine = createMobileVampEngine();

    await playbackEngine.initialise();
    await vampEngine.start(dyad);

    expect(getSharedMobileAudioContext()).toBeDefined();
    vampEngine.dispose();
    playbackEngine.dispose();
  });

  it('starts and stops without throwing', async () => {
    const engine = createMobileVampEngine();

    await engine.initialise();
    await engine.start(dyad);
    engine.stop();
    engine.dispose();

    jest.runOnlyPendingTimers();
  });

  it('uses looped buffer sources for the drone voices', async () => {
    const engine = createMobileVampEngine();
    const context = getSharedMobileAudioContext();
    const createBufferSource = jest.spyOn(context, 'createBufferSource');
    const createOscillator = jest.spyOn(context, 'createOscillator');

    await engine.start(dyad);

    expect(createBufferSource).toHaveBeenCalled();
    expect(createOscillator).not.toHaveBeenCalled();

    engine.dispose();
    jest.runOnlyPendingTimers();
  });
});
