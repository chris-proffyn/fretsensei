import {
  isPentatonicMode,
  type FretboardViewModel,
  type PentatonicShapePosition,
} from '@fretsensei/utils';
import { getMobileModeLabel } from '../constants/mobileLabels';

export function getMobileDisplaySummary(
  viewModel: FretboardViewModel,
  selectedPentatonicPositions: PentatonicShapePosition[],
): string {
  const key = viewModel.selectedKey.displayLabel;
  const modeLabel = getMobileModeLabel(
    viewModel.activeMode.mode.id,
    viewModel.activeMode.mode.shortName,
  );
  const base = `${key} ${modeLabel}`;

  if (!isPentatonicMode(viewModel.activeMode.mode)) {
    return base;
  }

  if (selectedPentatonicPositions.length === 1) {
    return `${base}, Position ${selectedPentatonicPositions[0]}`;
  }

  if (selectedPentatonicPositions.length > 1) {
    const positions = [...selectedPentatonicPositions]
      .sort((a, b) => Number(a) - Number(b))
      .join(', ');
    return `${base}, Positions ${positions}`;
  }

  return base;
}
