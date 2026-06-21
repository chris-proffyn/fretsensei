import type { FretboardViewModel } from '@fretsensei/utils';

interface ScreenReaderSummaryProps {
  viewModel: FretboardViewModel;
}

export function ScreenReaderSummary({ viewModel }: ScreenReaderSummaryProps) {
  const { selectedKey, activeMode, scaleMap, positionSummary, fretRange } =
    viewModel;

  const summary = [
    `${selectedKey.displayLabel} ${activeMode.mode.shortName}`,
    `Fret range ${fretRange.summary}`,
    `Scale notes ${scaleMap.map((item) => item.noteName).join(', ')}`,
    `Degrees ${scaleMap.map((item) => item.degree).join(', ')}`,
    positionSummary,
  ].join('. ');

  return (
    <div className="visually-hidden" aria-live="polite">
      {summary}
    </div>
  );
}
