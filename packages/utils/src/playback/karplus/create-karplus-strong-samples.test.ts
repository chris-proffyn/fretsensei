import {
  clampKarplusFrequency,
  createKarplusStrongSamples,
  getKarplusDelayLength,
} from './create-karplus-strong-samples';
import { KARPLUS_DEFAULTS } from './types';

describe('clampKarplusFrequency', () => {
  it('clamps frequencies below and above the safe range', () => {
    expect(clampKarplusFrequency(20)).toBe(KARPLUS_DEFAULTS.minFrequency);
    expect(clampKarplusFrequency(2000)).toBe(KARPLUS_DEFAULTS.maxFrequency);
    expect(clampKarplusFrequency(440)).toBe(440);
  });
});

describe('getKarplusDelayLength', () => {
  it('returns shorter delay buffers for higher frequencies', () => {
    expect(getKarplusDelayLength(44100, 110)).toBeGreaterThan(
      getKarplusDelayLength(44100, 880),
    );
  });
});

describe('createKarplusStrongSamples', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a mono buffer with duration plus release length', () => {
    const samples = createKarplusStrongSamples(44100, 440, {
      duration: 0.4,
      release: 0.1,
    });

    expect(samples.length).toBe(Math.ceil(0.5 * 44100));
  });

  it('keeps generated samples finite and within normalised bounds', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.75);

    const samples = createKarplusStrongSamples(44100, 220);
    let peak = 0;

    samples.forEach((sample) => {
      expect(Number.isFinite(sample)).toBe(true);
      peak = Math.max(peak, Math.abs(sample));
    });

    expect(peak).toBeLessThanOrEqual(KARPLUS_DEFAULTS.normalisePeak + 0.001);
    expect(peak).toBeGreaterThan(0);
  });
});
