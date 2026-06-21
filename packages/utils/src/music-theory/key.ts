import { NATURAL_KEYS } from '../constants/keys';
import type { NaturalKey, SelectedKeyViewModel } from '../types';

export function getSelectedKey(
  selectedNaturalKey: NaturalKey,
  flatKeyEnabled: boolean,
): SelectedKeyViewModel {
  const key =
    NATURAL_KEYS.find((item) => item.natural === selectedNaturalKey) ??
    NATURAL_KEYS[2];

  return flatKeyEnabled
    ? { root: key.flatRoot, displayLabel: key.flatLabel }
    : { root: key.root, displayLabel: key.label };
}

export function getKeyButtonLabel(
  natural: NaturalKey,
  flatKeyEnabled: boolean,
): string {
  const key = NATURAL_KEYS.find((item) => item.natural === natural);
  if (!key) {
    return natural;
  }

  return flatKeyEnabled ? key.flatLabel : key.label;
}
