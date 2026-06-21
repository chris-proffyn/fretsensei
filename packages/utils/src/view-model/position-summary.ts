import { isPentatonicMode } from '../constants/modes';
import { getCompactFlexibleRange } from '../fretboard/compact-range';
import {
  getSelectedFretEnd,
  getSelectedFretRange,
  isFullNeckSelected,
} from '../fretboard/fret-range';
import { getCombinedPositionRange, getPositionRange } from '../fretboard/pentatonic-position';
import type { ModeDefinition, NoteName, PentatonicPositionWindowsMap, PentatonicShapePosition } from '../types';

function formatPositionRange([start, end]: [number, number]): string {
  const displayStart = start < 0 ? start + 12 : start;
  const displayEnd = end < 0 ? end + 12 : end;
  return `frets ${displayStart}-${displayEnd}`;
}

export function getPositionSummary(
  root: NoteName,
  mode: ModeDefinition,
  options: {
    includeBlueNote: boolean;
    selectedPentatonicPositions: PentatonicShapePosition[];
    threeNotesPerString: boolean;
    extendedPattern: boolean;
    includeUpperPosition: boolean;
    selectedFretStart: number;
    selectedFretWidth: number;
    pentatonicPositionWindows: PentatonicPositionWindowsMap;
  },
): string {
  const {
    includeBlueNote,
    selectedPentatonicPositions,
    threeNotesPerString,
    extendedPattern,
    includeUpperPosition,
    selectedFretStart,
    selectedFretWidth,
    pentatonicPositionWindows,
  } = options;

  if (isPentatonicMode(mode)) {
    if (selectedPentatonicPositions.length === 0) {
      return 'Full neck';
    }

    const suffix = `${extendedPattern ? ' + extended' : ''}${includeUpperPosition ? ' + upper' : ''}`;

    if (selectedPentatonicPositions.length === 1) {
      const range = getPositionRange(
        root,
        selectedPentatonicPositions[0],
        mode,
        pentatonicPositionWindows,
      );
      if (!range) {
        return 'Full neck';
      }

      return `Position ${selectedPentatonicPositions[0]}: ${formatPositionRange(range)}${suffix}`;
    }

    const combinedRange = getCombinedPositionRange(
      root,
      selectedPentatonicPositions,
      mode,
      pentatonicPositionWindows,
    );
    if (!combinedRange) {
      return 'Full neck';
    }

    const positionLabel = selectedPentatonicPositions.join(', ');
    return `Positions ${positionLabel}: ${formatPositionRange(combinedRange)}${suffix}`;
  }

  if (isFullNeckSelected(selectedFretStart, selectedFretWidth)) {
    return 'Full neck';
  }

  const ranges = getSelectedFretRange(selectedFretStart, selectedFretWidth);
  if (!ranges) {
    return 'Full neck';
  }

  const areaLabel = `Frets ${selectedFretStart}-${getSelectedFretEnd(selectedFretStart, selectedFretWidth)}`;
  const shapeLabel = threeNotesPerString
    ? '3 notes per string'
    : 'compact flexible';
  const suffix = extendedPattern ? ' + extended' : ' root-to-root';

  if (!threeNotesPerString) {
    const compactRange = getCompactFlexibleRange(
      root,
      mode,
      ranges,
      includeBlueNote,
    );
    return `${areaLabel}: compact frets ${compactRange[0]}-${compactRange[1]}, ${shapeLabel}${suffix}`;
  }

  return `${areaLabel}: ${shapeLabel}${suffix}`;
}
