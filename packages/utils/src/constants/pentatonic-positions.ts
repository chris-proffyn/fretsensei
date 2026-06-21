/**
 * Pentatonic position fret windows, keyed by mode id then position number.
 *
 * Each value is [startOffset, endOffset] relative to the root fret on the low E
 * string (see getRootFret). For A minor pentatonic the root sits on low E fret 5,
 * so position 3 offsets [4, 8] → frets 9–13 (including E on the G string at fret 9).
 *
 * Edit these tuples to adjust the focused fret window and in-position range for
 * any key/mode/position combination.
 */
export const PENTATONIC_POSITION_WINDOWS: Record<
  string,
  Record<string, [number, number]>
> = {
  'major-pentatonic': {
    '1': [-1, 2],
    '2': [2, 5],
    '3': [4, 7],
    '4': [7, 9],
    '5': [9, 12],
  },
  'minor-pentatonic': {
    '1': [0, 3],
    '2': [3, 5],
    '3': [4, 8],
    '4': [7, 10],
    '5': [10, 12],
  },
};
