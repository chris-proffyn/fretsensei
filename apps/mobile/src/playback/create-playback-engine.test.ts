import Constants from 'expo-constants';
import {
  createMobilePlaybackEngine,
  getMobilePlaybackEngineKind,
} from './create-playback-engine';

describe('createMobilePlaybackEngine', () => {
  const originalEngine = process.env.EXPO_PUBLIC_PLAYBACK_ENGINE;

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalEngine === undefined) {
      delete process.env.EXPO_PUBLIC_PLAYBACK_ENGINE;
    } else {
      process.env.EXPO_PUBLIC_PLAYBACK_ENGINE = originalEngine;
    }
    delete process.env.PLAYBACK_ENGINE;
  });

  it('defaults to karplus engine outside Expo Go', () => {
    delete process.env.EXPO_PUBLIC_PLAYBACK_ENGINE;
    jest.replaceProperty(Constants, 'appOwnership', null);

    expect(getMobilePlaybackEngineKind()).toBe('karplus');
    expect(createMobilePlaybackEngine()).toEqual(
      expect.objectContaining({
        initialise: expect.any(Function),
        playSequence: expect.any(Function),
        stop: expect.any(Function),
        dispose: expect.any(Function),
      }),
    );
  });

  it('uses sample engine in Expo Go', () => {
    delete process.env.EXPO_PUBLIC_PLAYBACK_ENGINE;
    jest.replaceProperty(Constants, 'appOwnership', 'expo');

    expect(getMobilePlaybackEngineKind()).toBe('sample');
    expect(createMobilePlaybackEngine()).toEqual(
      expect.objectContaining({
        initialise: expect.any(Function),
        playSequence: expect.any(Function),
        stop: expect.any(Function),
        dispose: expect.any(Function),
      }),
    );
  });

  it('uses sample engine when PLAYBACK_ENGINE=sample', () => {
    process.env.PLAYBACK_ENGINE = 'sample';

    expect(getMobilePlaybackEngineKind()).toBe('sample');
    expect(createMobilePlaybackEngine()).toEqual(
      expect.objectContaining({
        initialise: expect.any(Function),
        playSequence: expect.any(Function),
        stop: expect.any(Function),
        dispose: expect.any(Function),
      }),
    );
  });
});
