import { normalizePentatonicPositionsForMode } from '../constants/pentatonic-positions';
import type { PentatonicShapePosition } from '../types';

export function getPentatonicPositionToolbarLabel(
  modeId: string,
  positions: PentatonicShapePosition[],
): string {
  if (positions.length === 0) {
    return 'Pos';
  }

  const sorted = normalizePentatonicPositionsForMode(modeId, positions);

  if (sorted.length === 0) {
    return 'Pos';
  }

  if (sorted.length === 1) {
    return `Pos${sorted[0]}`;
  }

  return `Pos${sorted.join('+')}`;
}

export function getPentatonicPositionAriaLabel(
  modeId: string,
  positions: PentatonicShapePosition[],
): string {
  if (positions.length === 0) {
    return 'Pentatonic position: none selected';
  }

  const sorted = normalizePentatonicPositionsForMode(modeId, positions);

  if (sorted.length === 0) {
    return 'Pentatonic position: none selected';
  }

  if (sorted.length === 1) {
    return `Pentatonic position: ${sorted[0]}`;
  }

  return `Pentatonic positions: ${sorted.join(', ')}`;
}

export function getPentatonicPositionButtonAriaLabel(
  position: PentatonicShapePosition,
): string {
  return `Position ${position}`;
}
