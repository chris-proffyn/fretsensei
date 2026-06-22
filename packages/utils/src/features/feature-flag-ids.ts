export const FEATURE_FLAG_IDS = ['oneChordVamp'] as const;

export type FeatureFlagId = (typeof FEATURE_FLAG_IDS)[number];
