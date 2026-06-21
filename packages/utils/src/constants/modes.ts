import type { ModeDefinition } from '../types';

export const MODES: readonly ModeDefinition[] = [
  {
    id: 'minor-pentatonic',
    name: 'Minor Pentatonic',
    shortName: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    blueNoteInterval: 6,
    blueNoteDegree: 'b5',
    feel: 'Classic blues, rock and minor five-note sound',
  },
  {
    id: 'major-pentatonic',
    name: 'Major Pentatonic',
    shortName: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    blueNoteInterval: 3,
    blueNoteDegree: 'b3',
    feel: 'Open, bright five-note major sound',
  },
  {
    id: 'ionian',
    name: 'Ionian / Major',
    shortName: 'Ionian',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    feel: 'Bright, resolved major sound',
  },
  {
    id: 'dorian',
    name: 'Dorian',
    shortName: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    feel: 'Minor sound with a bright 6',
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    shortName: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    feel: 'Dark minor sound with a flat 2',
  },
  {
    id: 'lydian',
    name: 'Lydian',
    shortName: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '#4', '5', '6', '7'],
    feel: 'Floating major sound with a sharp 4',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    shortName: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    feel: 'Dominant major sound with a flat 7',
  },
  {
    id: 'aeolian',
    name: 'Aeolian / Natural Minor',
    shortName: 'Aeolian',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    feel: 'Natural minor sound',
  },
  {
    id: 'locrian',
    name: 'Locrian',
    shortName: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    feel: 'Unstable diminished sound',
  },
];

export function getModeById(modeId: string): ModeDefinition {
  return MODES.find((mode) => mode.id === modeId) ?? MODES[0];
}

export function isPentatonicMode(mode: ModeDefinition): boolean {
  return mode.id === 'major-pentatonic' || mode.id === 'minor-pentatonic';
}

export function isModalMode(mode: ModeDefinition): boolean {
  return !isPentatonicMode(mode);
}
