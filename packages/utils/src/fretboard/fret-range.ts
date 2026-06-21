import {
  MAX_FRET,
  MAX_FRET_WINDOW_WIDTH,
  MIN_FRET,
  MIN_FRET_WINDOW_WIDTH,
} from '../constants/notes';

export function isFullNeckSelected(start: number, width: number): boolean {
  return start === 0 && width >= MAX_FRET_WINDOW_WIDTH;
}

export function getSelectedFretEnd(start: number, width: number): number {
  return Math.min(MAX_FRET, start + width - 1);
}

export function clampFretWindow(
  start: number,
  width: number,
): { start: number; width: number; end: number } {
  const clampedWidth = Math.max(
    MIN_FRET_WINDOW_WIDTH,
    Math.min(MAX_FRET_WINDOW_WIDTH, width),
  );
  const maxStart = Math.max(MIN_FRET, MAX_FRET_WINDOW_WIDTH - clampedWidth);
  const clampedStart = Math.max(MIN_FRET, Math.min(maxStart, start));
  const end = getSelectedFretEnd(clampedStart, clampedWidth);

  return { start: clampedStart, width: clampedWidth, end };
}

export function getSelectedFretRange(
  start: number,
  width: number,
): [number, number] | null {
  return isFullNeckSelected(start, width)
    ? null
    : [start, getSelectedFretEnd(start, width)];
}

export function getFretRangeSummary(start: number, width: number): string {
  if (isFullNeckSelected(start, width)) {
    return 'Full neck';
  }

  const end = getSelectedFretEnd(start, width);
  return `Frets ${start}-${end} (${width} frets)`;
}

export function getFretWindowLabel(start: number, width: number): string {
  return isFullNeckSelected(start, width)
    ? '0-24'
    : `${start}-${getSelectedFretEnd(start, width)}`;
}

export function adjustFretWindowStart(
  start: number,
  width: number,
  delta: number,
): { start: number; width: number } {
  const next = clampFretWindow(start + delta, width);
  return { start: next.start, width: next.width };
}

export function adjustFretWindowWidth(
  start: number,
  width: number,
  delta: number,
): { start: number; width: number } {
  const next = clampFretWindow(start, width + delta);
  return { start: next.start, width: next.width };
}
