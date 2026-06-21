import { NOTES } from '../constants/notes';
import type { NoteName, StringDefinition } from '../types';

export function noteAt(openNote: NoteName, fret: number): NoteName {
  const openIndex = NOTES.indexOf(openNote);
  return NOTES[(openIndex + fret) % NOTES.length];
}

export function pitchAt(stringData: StringDefinition, fret: number): number {
  return stringData.midi + fret;
}

export function frequencyFromMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function cellKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}
