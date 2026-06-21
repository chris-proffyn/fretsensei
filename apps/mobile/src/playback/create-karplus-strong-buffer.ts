import {
  createKarplusStrongSamples,
  type KarplusStrongOptions,
} from '@fretsensei/utils';
import type { AudioContext } from 'react-native-audio-api';

export function createKarplusStrongBuffer(
  context: AudioContext,
  frequency: number,
  options: KarplusStrongOptions = {},
) {
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
