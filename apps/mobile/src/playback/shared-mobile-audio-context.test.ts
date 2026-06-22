import { AudioContext } from 'react-native-audio-api';
import {
  getSharedMobileAudioContext,
  resetSharedMobileAudioContextForTests,
} from './shared-mobile-audio-context';

describe('getSharedMobileAudioContext', () => {
  afterEach(() => {
    resetSharedMobileAudioContextForTests();
  });

  it('returns the same context instance for multiple callers', () => {
    const first = getSharedMobileAudioContext();
    const second = getSharedMobileAudioContext();

    expect(first).toBe(second);
    expect(first).toBeInstanceOf(AudioContext);
  });
});
