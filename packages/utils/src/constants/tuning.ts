import type { StringDefinition } from '../types';

/** High E (string index 0) through low E (string index 5). */
export const STANDARD_TUNING: readonly StringDefinition[] = [
  { label: 'E', note: 'E', midi: 64, thickness: '2px' },
  { label: 'B', note: 'B', midi: 59, thickness: '2.4px' },
  { label: 'G', note: 'G', midi: 55, thickness: '2.8px' },
  { label: 'D', note: 'D', midi: 50, thickness: '3.4px' },
  { label: 'A', note: 'A', midi: 45, thickness: '4px' },
  { label: 'E', note: 'E', midi: 40, thickness: '4.8px' },
];

export const STRING_COUNT = STANDARD_TUNING.length;
export const FRET_POSITION_COUNT = 25;
