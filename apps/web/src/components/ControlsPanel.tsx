import type { FretboardViewModel, VisualiserState } from '@fretsensei/utils';
import type { UseVisualiserStateReturn } from '../hooks/useVisualiserState';
import { KeySelector } from './KeySelector';
import { Legend } from './Legend';
import { ModeSelector } from './ModeSelector';
import { OptionsRow } from './OptionsRow';
import { PentatonicPositionSelector } from './PentatonicPositionSelector';
import { ScaleMap } from './ScaleMap';

interface ControlsPanelProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: UseVisualiserStateReturn['dispatch'];
}

export function ControlsPanel({ state, viewModel, dispatch }: ControlsPanelProps) {
  return (
    <section className="controls compact-controls">
      <KeySelector
        selectedNaturalKey={state.selectedNaturalKey}
        flatKeyEnabled={state.flatKeyEnabled}
        onSelectKey={(key) => dispatch({ type: 'selectNaturalKey', key })}
        onToggleFlat={(enabled) => dispatch({ type: 'toggleFlatKey', enabled })}
      />

      <ModeSelector
        selectedModeId={state.selectedModeId}
        onSelectMode={(modeId) => dispatch({ type: 'selectMode', modeId })}
      />

      <OptionsRow
        state={state}
        activeMode={viewModel.activeMode}
        isFullNeck={viewModel.fretRange.isFullNeck}
        dispatch={dispatch}
      />

      <PentatonicPositionSelector
        visible={viewModel.activeMode.isPentatonic}
        value={state.selectedPentatonicPositions}
        onToggle={(position) =>
          dispatch({ type: 'togglePentatonicPosition', position })
        }
      />

      <div className="controls-bottom-row">
        <Legend />
        <ScaleMap items={viewModel.scaleMap} embedded />
      </div>
    </section>
  );
}
