import { frequencyFromMidi, type PlaybackNote } from '@fretsensei/utils';
import { createKarplusStrongBuffer } from './karplus-strong/create-karplus-strong-buffer';
import { getKarplusToneProfile } from './karplus-strong/get-karplus-tone-profile';

export interface KarplusStrongNoteResult {
  source: AudioBufferSourceNode;
}

export function playKarplusStrongNote(
  context: AudioContext,
  note: PlaybackNote,
  startDelay: number,
  _stepDuration: number,
  masterGain: GainNode,
): KarplusStrongNoteResult {
  const frequency = frequencyFromMidi(note.midi);
  const startTime = context.currentTime + startDelay;
  const toneProfile = getKarplusToneProfile({
    midi: note.midi,
    stringIndex: note.stringIndex,
    fret: note.fret,
  });

  const audibleDuration = toneProfile.duration + toneProfile.release;

  const buffer = createKarplusStrongBuffer(context, frequency, toneProfile);

  const source = context.createBufferSource();
  source.buffer = buffer;

  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = toneProfile.highpass;

  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = toneProfile.lowpass;
  lowpass.Q.value = 0.7;

  const body = context.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.value = toneProfile.bodyFrequency;
  body.Q.value = toneProfile.bodyQ;
  body.gain.value = toneProfile.bodyGain;

  const noteGain = context.createGain();
  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(toneProfile.gain, startTime + 0.012);
  noteGain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + audibleDuration,
  );

  source.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(body);
  body.connect(noteGain);
  noteGain.connect(masterGain);

  source.start(startTime);
  source.stop(startTime + audibleDuration + 0.05);

  return { source };
}
