import Constants from 'expo-constants';
import type { PlaybackEngine } from '@fretsensei/utils';

export type MobilePlaybackEngineKind = 'karplus' | 'sample';

function readConfiguredEngine(): MobilePlaybackEngineKind | null {
  const configured =
    process.env.EXPO_PUBLIC_PLAYBACK_ENGINE ??
    process.env.PLAYBACK_ENGINE;

  const normalized = configured?.trim().toLowerCase();
  if (normalized === 'sample') {
    return 'sample';
  }
  if (normalized === 'karplus') {
    return 'karplus';
  }

  return null;
}

export function resolveMobilePlaybackEngineKind(): MobilePlaybackEngineKind {
  const configured = readConfiguredEngine();
  if (configured) {
    return configured;
  }

  // Expo Go does not include the react-native-audio-api native module.
  if (Constants.appOwnership === 'expo') {
    return 'sample';
  }

  return 'karplus';
}

export function getMobilePlaybackEngineKind(): MobilePlaybackEngineKind {
  return resolveMobilePlaybackEngineKind();
}

export function createMobilePlaybackEngine(): PlaybackEngine {
  const kind = resolveMobilePlaybackEngineKind();

  if (kind === 'sample') {
    const { createExpoAvPlaybackEngine } =
      require('./expo-av-engine') as typeof import('./expo-av-engine');
    return createExpoAvPlaybackEngine();
  }

  const { createWebAudioPlaybackEngine } =
    require('./web-audio-engine') as typeof import('./web-audio-engine');
  return createWebAudioPlaybackEngine();
}
