import { createFeatureFlags, parseBuildTimeFlag } from '@fretsensei/utils';

export const BUILD_FEATURE_FLAGS = createFeatureFlags({
  oneChordVamp: parseBuildTimeFlag(process.env.EXPO_PUBLIC_FEATURE_ONE_CHORD_VAMP),
});

export function isOneChordVampEnabled(): boolean {
  return BUILD_FEATURE_FLAGS.oneChordVamp;
}
