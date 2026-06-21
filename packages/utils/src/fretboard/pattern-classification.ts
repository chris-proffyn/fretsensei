import { MAX_FRET, MIN_FRET } from '../constants/notes';
import { isModalMode, isPentatonicMode } from '../constants/modes';
import { STANDARD_TUNING } from '../constants/tuning';
import { getRootPitchBoundsForWindow } from './compact-range';
import {
  isExtendedFretAllowedForString,
} from './extended-pattern';
import { isFullNeckSelected, getSelectedFretRange } from './fret-range';
import {
  fretMatchesPrimaryPositionRange,
  fretMatchesUpperPositionRange,
} from './pentatonic-position';
import { resolvePentatonicPositionRange } from '../constants/layout-config';
import { getScaleNoteFretsForString } from './compact-range';
import { getThreeNotesPerStringPrimaryFrets } from './three-notes-per-string';
import { noteAt, pitchAt } from '../music-theory/note';
import type {
  ModeDefinition,
  NaturalKey,
  NoteName,
  PentatonicKeyDefaultsMap,
  PentatonicPositionWindowsMap,
  PentatonicShapePosition,
  PositionClassification,
} from '../types';

export interface PatternContext {
  includeBlueNote: boolean;
  selectedPentatonicPositions: PentatonicShapePosition[];
  threeNotesPerString: boolean;
  extendedPattern: boolean;
  includeUpperPosition: boolean;
  selectedFretStart: number;
  selectedFretWidth: number;
  pentatonicPositionWindows: PentatonicPositionWindowsMap;
  pentatonicKeyDefaults: PentatonicKeyDefaultsMap;
  selectedNaturalKey: NaturalKey;
  flatKeyEnabled: boolean;
  selectedModeId: string;
}

function isWithinRootStartedWindow(
  root: NoteName,
  fret: number,
  stringIndex: number,
  range: [number, number],
  extendedPattern: boolean,
): boolean {
  if (extendedPattern) {
    return true;
  }

  const bounds = getRootPitchBoundsForWindow(root, range);
  if (!bounds) {
    return true;
  }

  const stringData = STANDARD_TUNING[stringIndex];
  const pitch = pitchAt(stringData, fret);

  return pitch >= bounds.low && pitch <= bounds.high;
}

function fretMatchesActivePositionRange(
  fret: number,
  start: number,
  end: number,
): boolean {
  if (fretMatchesPrimaryPositionRange(fret, start, end)) {
    return true;
  }

  if (start < MIN_FRET) {
    return fretMatchesPrimaryPositionRange(fret, start + 12, end + 12);
  }

  if (end > MAX_FRET) {
    return fretMatchesPrimaryPositionRange(fret, start - 12, end - 12);
  }

  return false;
}

export function getPositionClassification(
  root: NoteName,
  fret: number,
  stringIndex: number,
  mode: ModeDefinition,
  context: PatternContext,
): PositionClassification {
  if (!isPentatonicMode(mode)) {
    return 'in-position';
  }

  const fullNeck = isFullNeckSelected(
    context.selectedFretStart,
    context.selectedFretWidth,
  );

  if (context.selectedPentatonicPositions.length === 0) {
    if (fullNeck) {
      return 'in-position';
    }

    const windowRange = getSelectedFretRange(
      context.selectedFretStart,
      context.selectedFretWidth,
    );
    if (!windowRange) {
      return 'in-position';
    }

    const [windowStart, windowEnd] = windowRange;
    const inWindow = fret >= windowStart && fret <= windowEnd;

    if (inWindow) {
      return 'in-position';
    }

    const isAllowedExtendedFret =
      context.extendedPattern &&
      isExtendedFretAllowedForString(fret, stringIndex, windowStart, windowEnd);

    return isAllowedExtendedFret ? 'extended' : 'out-of-position';
  }

  for (const position of context.selectedPentatonicPositions) {
    const range = resolvePentatonicPositionRange(
      context.pentatonicPositionWindows,
      context.pentatonicKeyDefaults,
      context.selectedModeId,
      context.selectedNaturalKey,
      context.flatKeyEnabled,
      position,
    );
    if (!range) {
      continue;
    }

    const [start, end] = range;

    if (fretMatchesActivePositionRange(fret, start, end)) {
      return 'in-position';
    }

    if (
      context.includeUpperPosition &&
      fretMatchesUpperPositionRange(fret, start, end)
    ) {
      return 'in-position';
    }
  }

  if (context.extendedPattern) {
    const windowRange = getSelectedFretRange(
      context.selectedFretStart,
      context.selectedFretWidth,
    );

    if (
      windowRange &&
      isExtendedFretAllowedForString(
        fret,
        stringIndex,
        windowRange[0],
        windowRange[1],
      )
    ) {
      return 'extended';
    }
  }

  return 'out-of-position';
}

function getModalClassificationForRangeWithoutRootBoundary(
  root: NoteName,
  fret: number,
  stringIndex: number,
  mode: ModeDefinition,
  openNote: NoteName,
  baseRange: [number, number],
  context: PatternContext,
): PositionClassification {
  const shapeCount = context.threeNotesPerString ? 3 : null;
  const [baseStart, baseEnd] = baseRange;

  if (!shapeCount) {
    const inSelectedWindow = fret >= baseStart && fret <= baseEnd;

    if (inSelectedWindow) {
      return 'in-position';
    }

    const isAllowedExtendedFret =
      context.extendedPattern &&
      isExtendedFretAllowedForString(fret, stringIndex, baseStart, baseEnd);

    return isAllowedExtendedFret ? 'extended' : 'out-of-position';
  }

  const searchRange: [number, number] = context.extendedPattern
    ? [baseStart - 2, baseEnd + 2]
    : [baseStart, baseEnd];

  const fretsInSearchRange = getScaleNoteFretsForString(
    openNote,
    root,
    mode,
    searchRange,
    context.includeBlueNote,
  );
  const fretsInBaseRange = fretsInSearchRange.filter(
    (scaleFret) => scaleFret >= baseStart && scaleFret <= baseEnd,
  );

  const primaryFrets =
    shapeCount === 3
      ? getThreeNotesPerStringPrimaryFrets(
          openNote,
          root,
          mode,
          baseRange,
          context.includeBlueNote,
        )
      : fretsInBaseRange.slice(0, shapeCount);
  const extendedFrets = context.extendedPattern
    ? fretsInSearchRange
        .filter((scaleFret) => !primaryFrets.includes(scaleFret))
        .filter((scaleFret) =>
          isExtendedFretAllowedForString(scaleFret, stringIndex, baseStart, baseEnd),
        )
        .slice(0, Math.max(0, shapeCount + 2))
    : [];

  if (primaryFrets.includes(fret)) {
    if (shapeCount === 3) {
      return 'in-position';
    }

    const isRootStarted = isWithinRootStartedWindow(
      root,
      fret,
      stringIndex,
      baseRange,
      context.extendedPattern,
    );
    return isRootStarted ? 'in-position' : 'out-of-position';
  }

  if (extendedFrets.includes(fret)) {
    return 'extended';
  }

  return 'out-of-position';
}

function getRootPitchBoundsForRange(
  root: NoteName,
  mode: ModeDefinition,
  baseRange: [number, number],
  context: PatternContext,
): { low: number; high: number } | null {
  if (context.extendedPattern) {
    return null;
  }

  const rootPitches: number[] = [];

  STANDARD_TUNING.forEach((stringData, stringIndex) => {
    for (let fret = MIN_FRET; fret <= MAX_FRET; fret++) {
      const noteName = noteAt(stringData.note, fret);

      if (noteName !== root) {
        continue;
      }

      const classification = getModalClassificationForRangeWithoutRootBoundary(
        root,
        fret,
        stringIndex,
        mode,
        stringData.note,
        baseRange,
        context,
      );

      if (classification === 'in-position') {
        rootPitches.push(pitchAt(stringData, fret));
      }
    }
  });

  if (rootPitches.length < 2) {
    return null;
  }

  return {
    low: Math.min(...rootPitches),
    high: Math.max(...rootPitches),
  };
}

function getModalClassificationForRange(
  root: NoteName,
  fret: number,
  stringIndex: number,
  mode: ModeDefinition,
  openNote: NoteName,
  baseRange: [number, number],
  context: PatternContext,
): PositionClassification {
  const baseClassification = getModalClassificationForRangeWithoutRootBoundary(
    root,
    fret,
    stringIndex,
    mode,
    openNote,
    baseRange,
    context,
  );

  if (
    baseClassification !== 'in-position' ||
    context.extendedPattern ||
    context.threeNotesPerString
  ) {
    return baseClassification;
  }

  const bounds = getRootPitchBoundsForRange(root, mode, baseRange, context);

  if (!bounds) {
    return baseClassification;
  }

  const stringData = STANDARD_TUNING[stringIndex];
  const pitch = pitchAt(stringData, fret);

  return pitch >= bounds.low && pitch <= bounds.high
    ? baseClassification
    : 'out-of-position';
}

export function getModalClassification(
  root: NoteName,
  fret: number,
  stringIndex: number,
  mode: ModeDefinition,
  openNote: NoteName,
  context: PatternContext,
): PositionClassification {
  if (
    !isModalMode(mode) ||
    isFullNeckSelected(context.selectedFretStart, context.selectedFretWidth)
  ) {
    return 'in-position';
  }

  const ranges = getSelectedFretRange(
    context.selectedFretStart,
    context.selectedFretWidth,
  );
  if (!ranges) {
    return 'in-position';
  }

  const classifications = [ranges].map((range) =>
    getModalClassificationForRange(
      root,
      fret,
      stringIndex,
      mode,
      openNote,
      range,
      context,
    ),
  );

  if (classifications.includes('in-position')) {
    return 'in-position';
  }

  if (classifications.includes('extended')) {
    return 'extended';
  }

  return 'out-of-position';
}

export function getPatternClassification(
  root: NoteName,
  fret: number,
  stringIndex: number,
  mode: ModeDefinition,
  openNote: NoteName,
  context: PatternContext,
): PositionClassification {
  if (
    isFullNeckSelected(context.selectedFretStart, context.selectedFretWidth)
  ) {
    return 'in-position';
  }

  return isPentatonicMode(mode)
    ? getPositionClassification(root, fret, stringIndex, mode, context)
    : getModalClassification(root, fret, stringIndex, mode, openNote, context);
}
