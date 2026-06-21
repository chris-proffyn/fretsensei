import { MAX_FRET, MIN_FRET } from '../constants/notes';
import { STANDARD_TUNING } from '../constants/tuning';
import { noteAt, pitchAt } from '../music-theory/note';
import { getScale } from '../music-theory/scale';
import { getRootFret } from './pentatonic-position';
import type { ModeDefinition, NoteName } from '../types';

export function countScaleNotesInRange(
  root: NoteName,
  mode: ModeDefinition,
  range: [number, number],
  includeBlueNote: boolean,
): number {
  const scaleNotes = getScale(root, mode, includeBlueNote);
  const [start, end] = range;
  let count = 0;

  STANDARD_TUNING.forEach((stringData) => {
    for (let fret = Math.max(MIN_FRET, start); fret <= Math.min(MAX_FRET, end); fret++) {
      const noteName = noteAt(stringData.note, fret);
      if (scaleNotes.includes(noteName)) {
        count += 1;
      }
    }
  });

  return count;
}

export function getRootFretDistanceToRange(
  root: NoteName,
  range: [number, number],
): number {
  const rootFret = getRootFret(root);
  const candidates = [rootFret, rootFret + 12, rootFret - 12];
  const [start, end] = range;

  return Math.min(
    ...candidates.map((candidate) => {
      if (candidate >= start && candidate <= end) {
        return 0;
      }

      return Math.min(Math.abs(candidate - start), Math.abs(candidate - end));
    }),
  );
}

export function getCompactFlexibleRange(
  root: NoteName,
  mode: ModeDefinition,
  baseRange: [number, number],
  includeBlueNote: boolean,
): [number, number] {
  const [baseStart, baseEnd] = baseRange;
  const compactSpan = 3;
  const areaSpan = baseEnd - baseStart;

  if (areaSpan <= compactSpan) {
    return baseRange;
  }

  const candidates: Array<{
    range: [number, number];
    noteCount: number;
    rootDistance: number;
    start: number;
  }> = [];

  for (let start = baseStart; start <= baseEnd - compactSpan; start++) {
    const range: [number, number] = [start, start + compactSpan];

    candidates.push({
      range,
      noteCount: countScaleNotesInRange(root, mode, range, includeBlueNote),
      rootDistance: getRootFretDistanceToRange(root, range),
      start,
    });
  }

  candidates.sort((a, b) => {
    if (b.noteCount !== a.noteCount) {
      return b.noteCount - a.noteCount;
    }

    if (a.rootDistance !== b.rootDistance) {
      return a.rootDistance - b.rootDistance;
    }

    return a.start - b.start;
  });

  return candidates[0]?.range ?? baseRange;
}

export function getScaleNoteFretsForString(
  openNote: NoteName,
  root: NoteName,
  mode: ModeDefinition,
  range: [number, number],
  includeBlueNote: boolean,
): number[] {
  const scaleNotes = getScale(root, mode, includeBlueNote);
  const [start, end] = range;
  const frets: number[] = [];

  for (let fret = Math.max(MIN_FRET, start); fret <= Math.min(MAX_FRET, end); fret++) {
    const noteName = noteAt(openNote, fret);
    if (scaleNotes.includes(noteName)) {
      frets.push(fret);
    }
  }

  return frets;
}

export function getDistanceToRange(
  fret: number,
  start: number,
  end: number,
): number {
  if (fret >= start && fret <= end) {
    return 0;
  }

  return fret < start ? start - fret : fret - end;
}

export function getRootPitchBoundsForWindow(
  root: NoteName,
  range: [number, number],
): { low: number; high: number } | null {
  const [start, end] = range;
  const rootPitches: number[] = [];

  STANDARD_TUNING.forEach((stringData) => {
    for (let fret = Math.max(MIN_FRET, start); fret <= Math.min(MAX_FRET, end); fret++) {
      const noteName = noteAt(stringData.note, fret);

      if (noteName === root) {
        rootPitches.push(pitchAt(stringData, fret));
      }
    }
  });

  if (!rootPitches.length) {
    return null;
  }

  return {
    low: Math.min(...rootPitches),
    high: Math.max(...rootPitches),
  };
}

/** Lowest root in range through the next root one octave higher (inclusive). */
export function getOneOctavePitchBounds(
  root: NoteName,
  range: [number, number],
): { low: number; high: number } | null {
  const windowBounds = getRootPitchBoundsForWindow(root, range);

  if (!windowBounds) {
    return null;
  }

  return {
    low: windowBounds.low,
    high: windowBounds.low + 12,
  };
}
