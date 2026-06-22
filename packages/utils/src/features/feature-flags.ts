import { FEATURE_FLAG_IDS, type FeatureFlagId } from './feature-flag-ids';

export type FeatureFlags = Record<FeatureFlagId, boolean>;

export function createFeatureFlags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
  const flags = {} as FeatureFlags;

  for (const id of FEATURE_FLAG_IDS) {
    flags[id] = overrides[id] ?? false;
  }

  return flags;
}

export function isFeatureEnabled(flags: FeatureFlags, id: FeatureFlagId): boolean {
  return flags[id];
}
