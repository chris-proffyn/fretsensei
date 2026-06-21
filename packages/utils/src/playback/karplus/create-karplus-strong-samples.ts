import { normaliseBuffer } from './normalise-buffer';
import { KARPLUS_DEFAULTS, type KarplusStrongOptions } from './types';

export function clampKarplusFrequency(frequency: number): number {
  return Math.max(
    KARPLUS_DEFAULTS.minFrequency,
    Math.min(KARPLUS_DEFAULTS.maxFrequency, frequency),
  );
}

export function getKarplusDelayLength(
  sampleRate: number,
  frequency: number,
): number {
  return Math.max(2, Math.round(sampleRate / clampKarplusFrequency(frequency)));
}

export function createKarplusStrongSamples(
  sampleRate: number,
  frequency: number,
  options: KarplusStrongOptions = {},
): Float32Array {
  const duration = options.duration ?? KARPLUS_DEFAULTS.ringDuration;
  const release = options.release ?? KARPLUS_DEFAULTS.release;
  const totalSamples = Math.ceil((duration + release) * sampleRate);

  const safeFrequency = clampKarplusFrequency(frequency);
  const delayLength = getKarplusDelayLength(sampleRate, safeFrequency);

  const damping = options.damping ?? KARPLUS_DEFAULTS.damping;
  const brightness = options.brightness ?? KARPLUS_DEFAULTS.brightness;
  const velocity = options.velocity ?? KARPLUS_DEFAULTS.velocity;
  const envelopeDecay =
    options.envelopeDecay ?? KARPLUS_DEFAULTS.envelopeDecay;

  const output = new Float32Array(totalSamples);
  const delay = new Float32Array(delayLength);

  for (let index = 0; index < delayLength; index += 1) {
    const white = Math.random() * 2 - 1;
    const softened =
      index > 0
        ? white * brightness + delay[index - 1] * (1 - brightness)
        : white;
    delay[index] = softened * velocity;
  }

  let bufferIndex = 0;

  for (let sampleIndex = 0; sampleIndex < totalSamples; sampleIndex += 1) {
    const current = delay[bufferIndex];
    const nextIndex = (bufferIndex + 1) % delayLength;
    const next = delay[nextIndex];
    const averaged = 0.5 * (current + next);

    delay[bufferIndex] = averaged * damping;

    const envelope = Math.exp((-envelopeDecay * sampleIndex) / totalSamples);
    output[sampleIndex] = current * envelope;

    bufferIndex = nextIndex;
  }

  normaliseBuffer(output, KARPLUS_DEFAULTS.normalisePeak);

  return output;
}
