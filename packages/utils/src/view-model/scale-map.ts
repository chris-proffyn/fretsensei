import { getActiveDegrees, getScale, isBlueNote } from '../music-theory/scale';
import type { ModeDefinition, NoteName, ScaleMapItem } from '../types';

export function buildScaleMap(
  root: NoteName,
  mode: ModeDefinition,
  includeBlueNote: boolean,
): ScaleMapItem[] {
  const scaleNotes = getScale(root, mode, includeBlueNote);
  const degrees = getActiveDegrees(mode, includeBlueNote);

  return scaleNotes.map((noteName, index) => ({
    degree: degrees[index] ?? '',
    noteName,
    isBlueNote: isBlueNote(root, noteName, mode, includeBlueNote),
  }));
}
