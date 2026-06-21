import type { NoteName } from '../types';

export const NOTES: readonly NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const CHROMATIC_INTERVALS: Record<number, string> = {
  0: '1',
  1: 'b2',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5 / #4',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
};

export const MARKER_FRETS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21, 24]);

export const MIN_FRET = 0;
export const MAX_FRET = 24;
export const MIN_FRET_WINDOW_WIDTH = 3;
export const MAX_FRET_WINDOW_WIDTH = 25;
export const MIN_BPM = 40;
export const MAX_BPM = 220;
export const DEFAULT_BPM = 90;
