import { createFeatureFlags, isFeatureEnabled } from './feature-flags';

describe('feature flags', () => {
  it('defaults all flags to false', () => {
    const flags = createFeatureFlags();
    expect(flags.oneChordVamp).toBe(false);
  });

  it('applies overrides', () => {
    const flags = createFeatureFlags({ oneChordVamp: true });
    expect(isFeatureEnabled(flags, 'oneChordVamp')).toBe(true);
  });
});
