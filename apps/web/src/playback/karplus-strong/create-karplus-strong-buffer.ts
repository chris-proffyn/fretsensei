import {
  createKarplusStrongSamples,
  type KarplusStrongOptions,
} from '@fretsensei/utils';

export function createKarplusStrongBuffer(
  context: AudioContext,
  frequency: number,
  options: KarplusStrongOptions = {},
): AudioBuffer {
  const samples = createKarplusStrongSamples(
    context.sampleRate,
    frequency,
    options,
  );
  const audioBuffer = context.createBuffer(
    1,
    samples.length,
    context.sampleRate,
  );
  audioBuffer.getChannelData(0).set(samples);
  return audioBuffer;
}

export {
  clampKarplusFrequency,
  getKarplusDelayLength,
} from '@fretsensei/utils';
