import { frequencyFromMidi, type PlaybackNote } from '@fretsensei/utils';
import type {
  AudioContext,
  GainNode,
  OscillatorNode,
} from 'react-native-audio-api';

export interface LegacySynthNoteResult {
  sources: OscillatorNode[];
}

export function playLegacySynthNote(
  context: AudioContext,
  note: PlaybackNote,
  startDelay: number,
  duration: number,
  masterGain: GainNode,
): LegacySynthNoteResult {
  const startTime = context.currentTime + startDelay;
  const stopTime = startTime + duration + 0.08;
  const frequency = frequencyFromMidi(note.midi);

  const mainOscillator = context.createOscillator();
  const bodyOscillator = context.createOscillator();
  const pluckGain = context.createGain();
  const bodyGain = context.createGain();
  const filter = context.createBiquadFilter();
  const outputGain = context.createGain();

  mainOscillator.type = 'triangle';
  mainOscillator.frequency.setValueAtTime(frequency, startTime);

  bodyOscillator.type = 'sine';
  bodyOscillator.frequency.setValueAtTime(frequency * 0.997, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3200, startTime);
  filter.frequency.exponentialRampToValueAtTime(900, startTime + duration);
  filter.Q.setValueAtTime(0.8, startTime);

  pluckGain.gain.setValueAtTime(0.0001, startTime);
  pluckGain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.008);
  pluckGain.gain.exponentialRampToValueAtTime(0.065, startTime + 0.09);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  bodyGain.gain.setValueAtTime(0.0001, startTime);
  bodyGain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.018);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.92);

  outputGain.gain.setValueAtTime(0.62, startTime);

  mainOscillator.connect(pluckGain);
  bodyOscillator.connect(bodyGain);
  pluckGain.connect(filter);
  bodyGain.connect(filter);
  filter.connect(outputGain);
  outputGain.connect(masterGain);

  mainOscillator.start(startTime);
  bodyOscillator.start(startTime);
  mainOscillator.stop(stopTime);
  bodyOscillator.stop(stopTime);

  return {
    sources: [mainOscillator, bodyOscillator],
  };
}
