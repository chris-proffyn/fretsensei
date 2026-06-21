import { getModeById, isPentatonicMode } from '../constants/modes';
import { STANDARD_TUNING } from '../constants/tuning';
import { getSelectedKey } from '../music-theory/key';
import { cellKey, noteAt, pitchAt } from '../music-theory/note';
import {
  getActiveDegrees,
  getActiveIntervals,
  getScale,
  getScaleDegree,
  isBlueNote,
} from '../music-theory/scale';
import {
  clampFretWindow,
  getFretRangeSummary,
  getFretWindowLabel,
  isFullNeckSelected,
} from '../fretboard/fret-range';
import { getOneOctavePitchBounds } from '../fretboard/compact-range';
import { isUpperPositionOccurrence } from '../fretboard/pentatonic-position';
import {
  getPatternClassification,
  type PatternContext,
} from '../fretboard/pattern-classification';
import { buildScaleMap } from './scale-map';
import { getPositionSummary } from './position-summary';
import type {
  ActiveModeViewModel,
  FretboardNoteCell,
  FretboardViewModel,
  NoteVisualState,
  PositionClassification,
  VisualiserState,
} from '../types';

function buildActiveModeViewModel(
  root: ReturnType<typeof getSelectedKey>['root'],
  state: VisualiserState,
): ActiveModeViewModel {
  const mode = getModeById(state.selectedModeId);

  return {
    mode,
    isPentatonic: isPentatonicMode(mode),
    isModal: !isPentatonicMode(mode),
    activeIntervals: getActiveIntervals(mode, state.includeBlueNote),
    activeDegrees: getActiveDegrees(mode, state.includeBlueNote),
    scaleNotes: getScale(root, mode, state.includeBlueNote),
  };
}

function getDisplayText(
  root: ReturnType<typeof getSelectedKey>['root'],
  noteName: FretboardNoteCell['noteName'],
  shouldHighlight: boolean,
  mode: ActiveModeViewModel['mode'],
  includeBlueNote: boolean,
  showScaleDegrees: boolean,
): string {
  const interval = getScaleDegree(root, noteName, mode, includeBlueNote);

  if (showScaleDegrees) {
    return shouldHighlight ? interval : '—';
  }

  return noteName;
}

function resolveVisualState(
  isInScale: boolean,
  shouldHighlight: boolean,
  isRoot: boolean,
  isExtended: boolean,
  isBlue: boolean,
  showOutsideNotes: boolean,
): NoteVisualState {
  if (isBlue) {
    return 'blue-note';
  }

  if (isExtended && isRoot) {
    return 'extended-root';
  }

  if (isExtended) {
    return 'extended';
  }

  if (shouldHighlight && isRoot) {
    return 'root';
  }

  if (shouldHighlight) {
    return 'scale';
  }

  if (isInScale) {
    return 'out-of-position';
  }

  return showOutsideNotes ? 'outside' : 'hidden';
}

function isPlayableCell(visualState: NoteVisualState): boolean {
  return (
    visualState === 'root' ||
    visualState === 'scale' ||
    visualState === 'blue-note' ||
    visualState === 'extended' ||
    visualState === 'extended-root'
  );
}

function applyOneOctaveLimit(
  positionClass: PositionClassification,
  pitch: number,
  bounds: { low: number; high: number } | null,
): PositionClassification {
  if (!bounds) {
    return positionClass;
  }

  if (pitch >= bounds.low && pitch <= bounds.high) {
    return positionClass;
  }

  if (positionClass === 'in-position' || positionClass === 'extended') {
    return 'out-of-position';
  }

  return positionClass;
}

export function buildFretboardViewModel(
  state: VisualiserState,
): FretboardViewModel {
  const clamped = clampFretWindow(
    state.selectedFretStart,
    state.selectedFretWidth,
  );
  const selectedKey = getSelectedKey(
    state.selectedNaturalKey,
    state.flatKeyEnabled,
  );
  const root = selectedKey.root;
  const activeMode = buildActiveModeViewModel(root, state);
  const { mode } = activeMode;
  const fullNeck = isFullNeckSelected(clamped.start, clamped.width);

  const patternContext: PatternContext = {
    includeBlueNote: state.includeBlueNote,
    selectedPentatonicPositions: state.selectedPentatonicPositions,
    threeNotesPerString: state.threeNotesPerString,
    extendedPattern: state.extendedPattern,
    includeUpperPosition: state.includeUpperPosition,
    selectedFretStart: clamped.start,
    selectedFretWidth: clamped.width,
    pentatonicPositionWindows: state.layoutConfig.pentatonicPositionWindows,
    pentatonicKeyDefaults: state.layoutConfig.pentatonicKeyDefaults,
    selectedNaturalKey: state.selectedNaturalKey,
    flatKeyEnabled: state.flatKeyEnabled,
    selectedModeId: state.selectedModeId,
  };
  const oneOctaveBounds =
    !fullNeck && state.limitToOneOctave
      ? getOneOctavePitchBounds(root, [clamped.start, clamped.end])
      : null;

  const cells: FretboardNoteCell[] = [];

  STANDARD_TUNING.forEach((stringData, stringIndex) => {
    for (let fret = 0; fret <= 24; fret++) {
      const noteName = noteAt(stringData.note, fret);
      const isRoot = noteName === root;
      const isInScale = activeMode.scaleNotes.includes(noteName);
      const midi = pitchAt(stringData, fret);
      let positionClass: PositionClassification = fullNeck && isInScale
        ? 'in-position'
        : getPatternClassification(
            root,
            fret,
            stringIndex,
            mode,
            stringData.note,
            patternContext,
          );

      if (isInScale && oneOctaveBounds) {
        positionClass = applyOneOctaveLimit(positionClass, midi, oneOctaveBounds);
      }

      const shouldHighlight = isInScale && positionClass !== 'out-of-position';
      const isExtended = isInScale && positionClass === 'extended';
      const isBlue =
        shouldHighlight && isBlueNote(root, noteName, mode, state.includeBlueNote);
      const visualState = resolveVisualState(
        isInScale,
        shouldHighlight,
        isRoot,
        isExtended,
        isBlue,
        state.showOutsideNotes,
      );
      const degree = getScaleDegree(root, noteName, mode, state.includeBlueNote);
      const displayText = getDisplayText(
        root,
        noteName,
        shouldHighlight,
        mode,
        state.includeBlueNote,
        state.showScaleDegrees,
      );
      const key = cellKey(stringIndex, fret);
      const isUpperPositionOnly =
        state.includeUpperPosition &&
        activeMode.isPentatonic &&
        state.selectedPentatonicPositions.length > 0 &&
        isUpperPositionOccurrence(
          fret,
          root,
          state.selectedPentatonicPositions,
          mode,
          state.layoutConfig.pentatonicPositionWindows,
        );

      cells.push({
        stringIndex,
        stringLabel: stringData.label,
        fret,
        noteName,
        midi,
        degree,
        isRoot,
        isInScale,
        isBlueNote: isBlue,
        positionClassification: positionClass,
        visualState,
        displayText,
        isPlayable: isPlayableCell(visualState) && !isUpperPositionOnly,
        title: `${stringData.label} string, fret ${fret}: ${noteName} / ${degree} / ${mode.shortName}${isBlue ? ' / Blue note' : ''}`,
        cellKey: key,
      });
    }
  });

  return {
    selectedKey,
    activeMode,
    fretRange: {
      start: clamped.start,
      end: clamped.end,
      width: clamped.width,
      isFullNeck: fullNeck,
      summary: getFretRangeSummary(clamped.start, clamped.width),
    },
    cells,
    scaleMap: buildScaleMap(root, mode, state.includeBlueNote),
    positionSummary: getPositionSummary(root, mode, {
      includeBlueNote: state.includeBlueNote,
      selectedPentatonicPositions: state.selectedPentatonicPositions,
      threeNotesPerString: state.threeNotesPerString,
      extendedPattern: state.extendedPattern,
      includeUpperPosition: state.includeUpperPosition,
      selectedFretStart: clamped.start,
      selectedFretWidth: clamped.width,
      pentatonicPositionWindows: state.layoutConfig.pentatonicPositionWindows,
    }),
  };
}

export function getFretWindowTrackLabel(start: number, width: number): string {
  return getFretWindowLabel(start, width);
}
