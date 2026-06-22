import { NOTES } from '../constants/notes';
import { frequencyFromMidi } from '../music-theory/note';
import type { NoteName, SelectedKeyViewModel, VampPlaybackState } from '../types';
import { displayNoteForFifth } from './vamp-display';
import type { VampDyad, VampNote } from './vamp-types';

export const LOW_DRONE_MIN_MIDI = 40;
export const LOW_DRONE_MAX_MIDI = 52;

export function noteNameFromMidi(midi: number): NoteName {
  const index = ((midi % 12) + 12) % 12;
  return NOTES[index];
}

export function getPerfectFifth(root: NoteName): NoteName {
  const rootIndex = NOTES.indexOf(root);
  return NOTES[(rootIndex + 7) % NOTES.length];
}

export function getNearestMidiForNoteInRange(
  noteName: NoteName,
  minMidi = LOW_DRONE_MIN_MIDI,
  maxMidi = LOW_DRONE_MAX_MIDI,
): number {
  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    if (noteNameFromMidi(midi) === noteName) {
      return midi;
    }
  }

  return 48;
}

function buildVampNote(noteName: NoteName, midi: number, role: 'root' | 'fifth'): VampNote {
  return {
    noteName,
    midi,
    frequency: frequencyFromMidi(midi),
    role,
  };
}

export function buildVampDyad(
  selectedKey: SelectedKeyViewModel,
  flatKeyEnabled = false,
): VampDyad {
  const root = selectedKey.root;
  const fifth = getPerfectFifth(root);
  const rootMidi = getNearestMidiForNoteInRange(root);
  const fifthMidi = rootMidi + 7;
  const fifthDisplay = displayNoteForFifth(fifth, flatKeyEnabled);

  return {
    keyRoot: root,
    displayRoot: selectedKey.displayLabel,
    root: buildVampNote(root, rootMidi, 'root'),
    fifth: buildVampNote(fifth, fifthMidi, 'fifth'),
    displayLabel: `${selectedKey.displayLabel} + ${fifthDisplay} drone`,
  };
}

export function getVampDyadKey(dyad: VampDyad): string {
  return `${dyad.root.midi}:${dyad.fifth.midi}`;
}

export function isVampPlaying(vampPlaybackState: VampPlaybackState): boolean {
  return vampPlaybackState === 'playing';
}
