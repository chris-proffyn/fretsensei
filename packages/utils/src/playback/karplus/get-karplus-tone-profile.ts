import {
  KARPLUS_DEFAULTS,
  KARPLUS_HIGH_FRET_OFFSETS,
  KARPLUS_STRING_OFFSETS,
  type KarplusStringOffsetProfile,
  type KarplusStrongOptions,
  type KarplusToneProfile,
} from './types';

interface ToneProfileInput {
  midi: number;
  stringIndex?: number;
  fret?: number;
}

function clampDamping(value: number): number {
  return Math.min(0.999, Math.max(0.9, value));
}

function clampLowpass(value: number): number {
  return Math.min(8000, Math.max(400, value));
}

function clampGain(value: number): number {
  return Math.min(1, Math.max(0.1, value));
}

function getStringOffsetProfile(stringIndex: number): KarplusStringOffsetProfile {
  if (stringIndex >= 4) {
    return KARPLUS_STRING_OFFSETS.low;
  }

  if (stringIndex <= 1) {
    return KARPLUS_STRING_OFFSETS.high;
  }

  return KARPLUS_STRING_OFFSETS.mid;
}

export function getKarplusToneProfile(
  input: ToneProfileInput,
  overrides: KarplusStrongOptions = {},
): KarplusToneProfile {
  const stringIndex = input.stringIndex;
  const fret = input.fret ?? 0;

  let damping = KARPLUS_DEFAULTS.damping;
  let lowpass = KARPLUS_DEFAULTS.lowpass;
  let gain = KARPLUS_DEFAULTS.gain;
  let ringDurationMultiplier = 1;

  if (stringIndex !== undefined && Number.isFinite(stringIndex)) {
    const offsets = getStringOffsetProfile(stringIndex);
    damping += offsets.dampingDelta;
    lowpass *= offsets.lowpassMultiplier;
    gain += offsets.gainDelta;
    ringDurationMultiplier = offsets.ringDurationMultiplier;
  }

  if (fret >= 12) {
    lowpass += KARPLUS_HIGH_FRET_OFFSETS.lowpassDelta;
    damping += KARPLUS_HIGH_FRET_OFFSETS.dampingDelta;
  }

  const ringDuration =
    (overrides.duration ?? KARPLUS_DEFAULTS.ringDuration) *
    ringDurationMultiplier;

  return {
    duration: ringDuration,
    release: overrides.release ?? KARPLUS_DEFAULTS.release,
    damping: clampDamping(overrides.damping ?? damping),
    brightness: overrides.brightness ?? KARPLUS_DEFAULTS.brightness,
    velocity: overrides.velocity ?? KARPLUS_DEFAULTS.velocity,
    envelopeDecay:
      overrides.envelopeDecay ?? KARPLUS_DEFAULTS.envelopeDecay,
    highpass: KARPLUS_DEFAULTS.highpass,
    lowpass: clampLowpass(lowpass),
    bodyFrequency: KARPLUS_DEFAULTS.bodyFrequency,
    bodyQ: KARPLUS_DEFAULTS.bodyQ,
    bodyGain: KARPLUS_DEFAULTS.bodyGain,
    gain: clampGain(gain),
  };
}
