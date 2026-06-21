import { CHROMATIC_INTERVALS, NOTES } from '../constants/notes';
import { isPentatonicMode } from '../constants/modes';
import type { ModeDefinition, NoteName } from '../types';

export function getActiveIntervals(
  mode: ModeDefinition,
  includeBlueNote: boolean,
): number[] {
  const intervals = [...mode.intervals];

  if (
    isPentatonicMode(mode) &&
    includeBlueNote &&
    typeof mode.blueNoteInterval === 'number'
  ) {
    intervals.push(mode.blueNoteInterval);
  }

  return [...new Set(intervals)].sort((a, b) => a - b);
}

export function getActiveDegrees(
  mode: ModeDefinition,
  includeBlueNote: boolean,
): string[] {
  const intervals = getActiveIntervals(mode, includeBlueNote);

  return intervals.map((interval) => {
    const originalIndex = mode.intervals.indexOf(interval);

    if (originalIndex >= 0) {
      return mode.degrees[originalIndex];
    }

    if (interval === mode.blueNoteInterval) {
      return mode.blueNoteDegree ?? CHROMATIC_INTERVALS[interval];
    }

    return CHROMATIC_INTERVALS[interval];
  });
}

export function getScale(
  root: NoteName,
  mode: ModeDefinition,
  includeBlueNote: boolean,
): NoteName[] {
  const rootIndex = NOTES.indexOf(root);
  return getActiveIntervals(mode, includeBlueNote).map(
    (interval) => NOTES[(rootIndex + interval) % NOTES.length],
  );
}

export function getIntervalFromRoot(root: NoteName, noteName: NoteName): string {
  const rootIndex = NOTES.indexOf(root);
  const noteIndex = NOTES.indexOf(noteName);
  const distance = (noteIndex - rootIndex + 12) % 12;
  return CHROMATIC_INTERVALS[distance];
}

export function getScaleDegree(
  root: NoteName,
  noteName: NoteName,
  mode: ModeDefinition,
  includeBlueNote: boolean,
): string {
  const rootIndex = NOTES.indexOf(root);
  const noteIndex = NOTES.indexOf(noteName);
  const distance = (noteIndex - rootIndex + 12) % 12;
  const activeIntervals = getActiveIntervals(mode, includeBlueNote);
  const activeDegrees = getActiveDegrees(mode, includeBlueNote);
  const scaleIndex = activeIntervals.indexOf(distance);

  return scaleIndex >= 0
    ? activeDegrees[scaleIndex]
    : getIntervalFromRoot(root, noteName);
}

export function isBlueNote(
  root: NoteName,
  noteName: NoteName,
  mode: ModeDefinition,
  includeBlueNote: boolean,
): boolean {
  if (
    !isPentatonicMode(mode) ||
    !includeBlueNote ||
    typeof mode.blueNoteInterval !== 'number'
  ) {
    return false;
  }

  const rootIndex = NOTES.indexOf(root);
  const noteIndex = NOTES.indexOf(noteName);
  const distance = (noteIndex - rootIndex + 12) % 12;

  return distance === mode.blueNoteInterval;
}
