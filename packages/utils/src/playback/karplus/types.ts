export interface KarplusStrongOptions {
  duration?: number;
  release?: number;
  damping?: number;
  brightness?: number;
  velocity?: number;
  envelopeDecay?: number;
  stringIndex?: number;
  fret?: number;
}

export interface KarplusToneProfile {
  duration: number;
  release: number;
  damping: number;
  brightness: number;
  velocity: number;
  envelopeDecay: number;
  highpass: number;
  lowpass: number;
  bodyFrequency: number;
  bodyQ: number;
  bodyGain: number;
  gain: number;
}

/** Relative tweaks applied on top of KARPLUS_DEFAULTS per string group. */
export interface KarplusStringOffsetProfile {
  dampingDelta: number;
  lowpassMultiplier: number;
  gainDelta: number;
  ringDurationMultiplier: number;
}

export const KARPLUS_DEFAULTS = {
  ringDuration: 1.15,
  release: 0.1,
  damping: 0.972,
  brightness: 0.22,
  velocity: 0.74,
  envelopeDecay: 5.2,
  highpass: 85,
  lowpass: 1750,
  bodyFrequency: 190,
  bodyQ: 1.15,
  bodyGain: 1.2,
  gain: 0.5,
  masterGain: 0.68,
  minFrequency: 55,
  maxFrequency: 1400,
  normalisePeak: 0.88,
} as const;

/** stringIndex 0 = high E, 5 = low E (see STANDARD_TUNING). */
export const KARPLUS_STRING_OFFSETS = {
  low: {
    dampingDelta: 0.004,
    lowpassMultiplier: 0.92,
    gainDelta: 0.04,
    ringDurationMultiplier: 1.08,
  },
  mid: {
    dampingDelta: 0.002,
    lowpassMultiplier: 0.98,
    gainDelta: 0.02,
    ringDurationMultiplier: 1,
  },
  high: {
    dampingDelta: -0.002,
    lowpassMultiplier: 1.06,
    gainDelta: -0.02,
    ringDurationMultiplier: 0.9,
  },
} as const satisfies Record<string, KarplusStringOffsetProfile>;

/** Applied when fret >= 12 for a slightly brighter, upper-register tone. */
export const KARPLUS_HIGH_FRET_OFFSETS = {
  lowpassDelta: 120,
  dampingDelta: 0.001,
} as const;
