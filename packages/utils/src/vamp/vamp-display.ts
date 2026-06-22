import { NATURAL_KEYS } from '../constants/keys';
import type { NoteName } from '../types';

export function displayNoteForFifth(fifth: NoteName, flatKeyEnabled: boolean): string {
  if (flatKeyEnabled) {
    const flatMatch = NATURAL_KEYS.find((key) => key.flatRoot === fifth);
    if (flatMatch) {
      return flatMatch.flatLabel;
    }
  }

  return fifth;
}
