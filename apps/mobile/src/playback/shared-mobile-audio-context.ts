import { AudioContext } from 'react-native-audio-api';

let sharedContext: AudioContext | null = null;

/**
 * Mobile playback and vamp must share one AudioContext. Creating multiple
 * native contexts can crash the app when vamp starts.
 */
export function getSharedMobileAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContext();
  }

  return sharedContext;
}

/** @internal Test helper */
export function resetSharedMobileAudioContextForTests(): void {
  sharedContext = null;
}
