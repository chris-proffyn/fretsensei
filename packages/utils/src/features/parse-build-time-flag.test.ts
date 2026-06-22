import { parseBuildTimeFlag } from './parse-build-time-flag';

describe('parseBuildTimeFlag', () => {
  it('defaults to false when unset', () => {
    expect(parseBuildTimeFlag(undefined)).toBe(false);
    expect(parseBuildTimeFlag('')).toBe(false);
  });

  it('parses truthy and falsy strings', () => {
    expect(parseBuildTimeFlag('true')).toBe(true);
    expect(parseBuildTimeFlag('1')).toBe(true);
    expect(parseBuildTimeFlag('yes')).toBe(true);
    expect(parseBuildTimeFlag('false')).toBe(false);
    expect(parseBuildTimeFlag('0')).toBe(false);
    expect(parseBuildTimeFlag('no')).toBe(false);
  });

  it('returns default for unknown values', () => {
    expect(parseBuildTimeFlag('maybe', true)).toBe(true);
    expect(parseBuildTimeFlag('maybe', false)).toBe(false);
  });
});
