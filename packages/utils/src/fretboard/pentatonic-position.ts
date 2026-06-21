import { NOTES } from '../constants/notes';
import { PENTATONIC_POSITION_WINDOWS } from '../constants/pentatonic-positions';
import { isPentatonicMode } from '../constants/modes';
import { MAX_FRET, MIN_FRET } from '../constants/notes';
import type {
  ModeDefinition,
  NoteName,
  PentatonicPositionWindowsMap,
  PentatonicShapePosition,
} from '../types';

export function getRootFret(root: NoteName): number {
  const lowEOpenIndex = NOTES.indexOf('E');
  const rootIndex = NOTES.indexOf(root);
  return (rootIndex - lowEOpenIndex + 12) % 12;
}

export function normalizeFretRange(start: number, end: number): [number, number] {
  let normalizedStart = start;
  let normalizedEnd = end;

  while (normalizedStart < 0) {
    normalizedStart += 12;
    normalizedEnd += 12;
  }

  while (normalizedEnd > MAX_FRET && normalizedStart >= 12) {
    normalizedStart -= 12;
    normalizedEnd -= 12;
  }

  return [Math.max(MIN_FRET, normalizedStart), Math.min(MAX_FRET, normalizedEnd)];
}

export function getPositionRange(
  root: NoteName,
  selectedPosition: PentatonicShapePosition,
  mode: ModeDefinition,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): [number, number] | null {
  if (!isPentatonicMode(mode)) {
    return null;
  }

  const modeWindows = PENTATONIC_POSITION_WINDOWS[mode.id];
  const offsetRange = modeWindows?.[selectedPosition];

  if (!offsetRange) {
    return null;
  }

  const rootFret = getRootFret(root);
  const start = rootFret + offsetRange[0];
  const end = rootFret + offsetRange[1];

  return normalizeFretRange(start, end);
}

export function getWrappedPositionRanges(
  start: number,
  end: number,
): [number, number][] {
  const candidates: [number, number][] = [
    [start, end],
    [start + 12, end + 12],
    [start - 12, end - 12],
  ];

  if (start < 0) {
    candidates.push([start + 12, end + 12]);
  }

  if (end > MAX_FRET) {
    candidates.push([start - 12, end - 12]);
  }

  const unique = new Map<string, [number, number]>();

  for (const [rangeStart, rangeEnd] of candidates) {
    const clampedStart = Math.max(MIN_FRET, rangeStart);
    const clampedEnd = Math.min(MAX_FRET, rangeEnd);

    if (clampedStart <= clampedEnd) {
      unique.set(`${clampedStart}-${clampedEnd}`, [clampedStart, clampedEnd]);
    }
  }

  return [...unique.values()];
}

export function fretMatchesPrimaryPositionRange(
  fret: number,
  start: number,
  end: number,
): boolean {
  return fret >= start && fret <= end;
}

export function fretMatchesUpperPositionRange(
  fret: number,
  start: number,
  end: number,
): boolean {
  const upperStart = start + 12;
  const upperEnd = end + 12;

  if (upperStart > MAX_FRET) {
    return false;
  }

  return fret >= upperStart && fret <= Math.min(MAX_FRET, upperEnd);
}

export function fretMatchesWrappedRange(
  fret: number,
  start: number,
  end: number,
): boolean {
  return getWrappedPositionRanges(start, end).some(
    ([rangeStart, rangeEnd]) => fret >= rangeStart && fret <= rangeEnd,
  );
}

export function getCombinedPositionRange(
  root: NoteName,
  selectedPositions: PentatonicShapePosition[],
  mode: ModeDefinition,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): [number, number] | null {
  if (selectedPositions.length === 0 || !isPentatonicMode(mode)) {
    return null;
  }

  const ranges = selectedPositions
    .map((position) => getPositionRange(root, position, mode, windows))
    .filter((range): range is [number, number] => range !== null);

  if (ranges.length === 0) {
    return null;
  }

  const start = Math.min(...ranges.map(([rangeStart]) => rangeStart));
  const end = Math.max(...ranges.map(([, rangeEnd]) => rangeEnd));

  return [start, end];
}

export function fretMatchesAnyPositionRange(
  fret: number,
  root: NoteName,
  selectedPositions: PentatonicShapePosition[],
  mode: ModeDefinition,
  includeUpper = false,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): boolean {
  return selectedPositions.some((position) => {
    const range = getPositionRange(root, position, mode, windows);
    if (!range) {
      return false;
    }

    const [start, end] = range;

    if (fretMatchesPrimaryPositionRange(fret, start, end)) {
      return true;
    }

    return includeUpper && fretMatchesUpperPositionRange(fret, start, end);
  });
}

export function isUpperPositionOccurrence(
  fret: number,
  root: NoteName,
  selectedPositions: PentatonicShapePosition[],
  mode: ModeDefinition,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): boolean {
  if (selectedPositions.length === 0) {
    return false;
  }

  return selectedPositions.some((position) => {
    const range = getPositionRange(root, position, mode, windows);
    if (!range) {
      return false;
    }

    const [start, end] = range;

    if (fretMatchesPrimaryPositionRange(fret, start, end)) {
      return false;
    }

    return fretMatchesUpperPositionRange(fret, start, end);
  });
}

export function alignFretWindowToPentatonicPositions(
  root: NoteName,
  selectedPositions: PentatonicShapePosition[],
  mode: ModeDefinition,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): { start: number; width: number } | null {
  const range = getCombinedPositionRange(root, selectedPositions, mode, windows);
  if (!range) {
    return null;
  }

  const [start, end] = range;
  return { start, width: end - start + 1 };
}

export function alignFretWindowToPentatonicPosition(
  root: NoteName,
  selectedPosition: PentatonicShapePosition,
  mode: ModeDefinition,
  windows: PentatonicPositionWindowsMap = PENTATONIC_POSITION_WINDOWS as PentatonicPositionWindowsMap,
): { start: number; width: number } | null {
  return alignFretWindowToPentatonicPositions(root, [selectedPosition], mode, windows);
}
