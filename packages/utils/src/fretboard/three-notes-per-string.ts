import { MAX_FRET, MIN_FRET } from '../constants/notes';
import {
  getDistanceToRange,
  getScaleNoteFretsForString,
} from './compact-range';
import type { ModeDefinition, NoteName } from '../types';

export function getThreeNotesPerStringPrimaryFrets(
  openNote: NoteName,
  root: NoteName,
  mode: ModeDefinition,
  baseRange: [number, number],
  includeBlueNote: boolean,
): number[] {
  const [baseStart, baseEnd] = baseRange;
  const targetCount = 3;
  const centre = (baseStart + baseEnd) / 2;

  let candidateFrets = getScaleNoteFretsForString(
    openNote,
    root,
    mode,
    [Math.max(MIN_FRET, baseStart - 5), Math.min(MAX_FRET, baseEnd + 5)],
    includeBlueNote,
  );

  if (candidateFrets.length < targetCount) {
    candidateFrets = getScaleNoteFretsForString(
      openNote,
      root,
      mode,
      [MIN_FRET, MAX_FRET],
      includeBlueNote,
    );
  }

  const inWindow = candidateFrets
    .filter((fret) => fret >= baseStart && fret <= baseEnd)
    .sort(
      (a, b) => Math.abs(a - centre) - Math.abs(b - centre) || a - b,
    );

  const outsideWindow = candidateFrets
    .filter((fret) => fret < baseStart || fret > baseEnd)
    .sort((a, b) => {
      const distanceDiff =
        getDistanceToRange(a, baseStart, baseEnd) -
        getDistanceToRange(b, baseStart, baseEnd);
      if (distanceDiff !== 0) {
        return distanceDiff;
      }

      return Math.abs(a - centre) - Math.abs(b - centre) || a - b;
    });

  const selected: number[] = [];

  [...inWindow, ...outsideWindow].forEach((fret) => {
    if (selected.length < targetCount && !selected.includes(fret)) {
      selected.push(fret);
    }
  });

  return selected.sort((a, b) => a - b);
}
