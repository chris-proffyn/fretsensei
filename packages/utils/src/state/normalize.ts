import { MAX_FRET_WINDOW_WIDTH } from '../constants/notes';
import { getModeById, isPentatonicMode } from '../constants/modes';
import { clampFretWindow, isFullNeckSelected } from '../fretboard/fret-range';
import { resolvePentatonicFretWindow } from '../constants/layout-config';
import { clampBpm } from '../playback/sequence';
import type { PentatonicShapePosition, VisualiserState } from '../types';

const PENTATONIC_POSITION_ORDER: PentatonicShapePosition[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
];

function normalizePentatonicPositions(
  positions: PentatonicShapePosition[],
): PentatonicShapePosition[] {
  const unique = new Set(positions.filter((position) => PENTATONIC_POSITION_ORDER.includes(position)));
  return PENTATONIC_POSITION_ORDER.filter((position) => unique.has(position));
}

export function normalizeVisualiserState(
  state: VisualiserState,
): VisualiserState {
  const mode = getModeById(state.selectedModeId);
  const isPentatonic = isPentatonicMode(mode);
  const selectedPentatonicPositions = isPentatonic
    ? normalizePentatonicPositions(state.selectedPentatonicPositions)
    : [];

  let selectedFretStart = state.selectedFretStart;
  let selectedFretWidth = state.selectedFretWidth;

  if (isPentatonic) {
    if (selectedPentatonicPositions.length > 0) {
      const aligned = resolvePentatonicFretWindow(
        state.layoutConfig,
        state.selectedModeId,
        state.selectedNaturalKey,
        state.flatKeyEnabled,
        selectedPentatonicPositions,
      );
      if (aligned) {
        selectedFretStart = aligned.start;
        selectedFretWidth = aligned.width;
      }
    }
  }

  const fretWindow = clampFretWindow(selectedFretStart, selectedFretWidth);
  const fullNeck = isFullNeckSelected(fretWindow.start, fretWindow.width);

  return {
    ...state,
    includeBlueNote: isPentatonic ? state.includeBlueNote : false,
    selectedPentatonicPositions,
    threeNotesPerString:
      !fullNeck && !isPentatonic ? state.threeNotesPerString : false,
    limitToOneOctave: !fullNeck && state.limitToOneOctave,
    includeUpperPosition:
      isPentatonic &&
      !fullNeck &&
      selectedPentatonicPositions.length > 0 &&
      state.includeUpperPosition,
    extendedPattern: !fullNeck ? state.extendedPattern : false,
    selectedFretStart: fretWindow.start,
    selectedFretWidth: fretWindow.width,
    bpm: clampBpm(state.bpm),
    subdivision: Math.max(1, Math.min(4, state.subdivision)) as 1 | 2 | 3 | 4,
  };
}
