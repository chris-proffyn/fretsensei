export function normaliseBuffer(
  samples: Float32Array,
  targetPeak = 0.92,
): void {
  let peak = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const value = samples[index];
    if (!Number.isFinite(value)) {
      samples[index] = 0;
      continue;
    }

    peak = Math.max(peak, Math.abs(value));
  }

  if (peak <= 0) {
    return;
  }

  const scale = targetPeak / peak;

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] *= scale;
  }
}
