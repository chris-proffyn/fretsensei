import type { VampEngine } from '@fretsensei/utils';
import { getMobilePlaybackEngineKind } from './create-playback-engine';
import { createMobileVampEngine } from './mobile-vamp-engine';

export function isMobileVampEngineSupported(): boolean {
  return getMobilePlaybackEngineKind() !== 'sample';
}

export function createMobileVampEngineFactory(): VampEngine | null {
  if (!isMobileVampEngineSupported()) {
    return null;
  }

  return createMobileVampEngine();
}
