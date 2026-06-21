import { frequencyFromMidi, type PlaybackNote } from '@fretsensei/utils';

function makeDistortionCurve(amount = 80): Float32Array {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

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
  const drive = context.createWaveShaper();
  const outputGain = context.createGain();

  mainOscillator.type = 'triangle';
  mainOscillator.frequency.setValueAtTime(frequency, startTime);

  bodyOscillator.type = 'sine';
  bodyOscillator.frequency.setValueAtTime(frequency * 0.997, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3200, startTime);
  filter.frequency.exponentialRampToValueAtTime(900, startTime + duration);
  filter.Q.setValueAtTime(0.8, startTime);

  drive.curve = makeDistortionCurve(28) as Float32Array<ArrayBuffer>;
  drive.oversample = '2x';

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
  filter.connect(drive);
  drive.connect(outputGain);
  outputGain.connect(masterGain);

  mainOscillator.start(startTime);
  bodyOscillator.start(startTime);
  mainOscillator.stop(stopTime);
  bodyOscillator.stop(stopTime);

  return {
    sources: [mainOscillator, bodyOscillator],
  };
}
