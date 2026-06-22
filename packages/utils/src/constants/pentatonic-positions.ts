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
import type { PentatonicShapePosition } from '../types';

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

function sortPentatonicPositions(
  positions: Iterable<string>,
): PentatonicShapePosition[] {
  return [...positions].sort(
    (left, right) => Number(left) - Number(right),
  ) as PentatonicShapePosition[];
}

/** Ordered position ids configured for a pentatonic mode. */
export function getPentatonicPositionsForMode(
  modeId: string,
): PentatonicShapePosition[] {
  const windows = PENTATONIC_POSITION_WINDOWS[modeId];
  if (!windows) {
    return [];
  }

  return sortPentatonicPositions(Object.keys(windows));
}

/** Union of all configured position ids across pentatonic modes. */
export function getCanonicalPentatonicPositions(): PentatonicShapePosition[] {
  const positions = new Set<string>();

  for (const modeWindows of Object.values(PENTATONIC_POSITION_WINDOWS)) {
    for (const position of Object.keys(modeWindows)) {
      positions.add(position);
    }
  }

  return sortPentatonicPositions(positions);
}

export function isConfiguredPentatonicPosition(
  modeId: string,
  position: string,
): position is PentatonicShapePosition {
  return Boolean(PENTATONIC_POSITION_WINDOWS[modeId]?.[position]);
}

/** Keep only positions configured for the mode, in canonical order. */
export function normalizePentatonicPositionsForMode(
  modeId: string,
  positions: PentatonicShapePosition[],
): PentatonicShapePosition[] {
  const order = getPentatonicPositionsForMode(modeId);
  const selected = new Set(
    positions.filter((position) => order.includes(position)),
  );

  return order.filter((position) => selected.has(position));
}

export function getPentatonicPositionWindow(
  modeId: string,
  position: PentatonicShapePosition,
): [number, number] | undefined {
  return PENTATONIC_POSITION_WINDOWS[modeId]?.[position];
}
