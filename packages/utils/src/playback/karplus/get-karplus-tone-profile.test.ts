import { getKarplusToneProfile } from './get-karplus-tone-profile';
import { KARPLUS_DEFAULTS } from './types';

describe('getKarplusToneProfile', () => {
  it('uses KARPLUS_DEFAULTS when string index is absent', () => {
    const profile = getKarplusToneProfile({ midi: 64 });

    expect(profile.damping).toBe(KARPLUS_DEFAULTS.damping);
    expect(profile.lowpass).toBe(KARPLUS_DEFAULTS.lowpass);
    expect(profile.gain).toBe(KARPLUS_DEFAULTS.gain);
    expect(profile.duration).toBe(KARPLUS_DEFAULTS.ringDuration);
  });

  it('returns warmer settings for low strings', () => {
    const lowString = getKarplusToneProfile({ midi: 45, stringIndex: 5 });
    const highString = getKarplusToneProfile({ midi: 64, stringIndex: 0 });

    expect(lowString.damping).toBeGreaterThan(highString.damping);
    expect(lowString.lowpass).toBeLessThan(highString.lowpass);
    expect(lowString.gain).toBeGreaterThan(highString.gain);
  });

  it('brightens tone for higher frets', () => {
    const open = getKarplusToneProfile({ midi: 64, stringIndex: 0, fret: 0 });
    const highFret = getKarplusToneProfile({ midi: 76, stringIndex: 0, fret: 12 });

    expect(highFret.lowpass).toBeGreaterThan(open.lowpass);
    expect(highFret.damping).toBeGreaterThan(open.damping);
  });

  it('honours explicit overrides on top of defaults', () => {
    const profile = getKarplusToneProfile(
      { midi: 64, stringIndex: 0 },
      { damping: 0.965, brightness: 0.35 },
    );

    expect(profile.damping).toBe(0.965);
    expect(profile.brightness).toBe(0.35);
  });
});
