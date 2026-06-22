import {
  getKeyButtonLabel,
  getPentatonicPositionAriaLabel,
  getPentatonicPositionToolbarLabel,
  type FretboardViewModel,
  type NaturalKey,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import { KeySelector } from './KeySelector';
import { ModeSelector } from './ModeSelector';
import { OptionsRow } from './OptionsRow';
import { PentatonicPositionSelector } from './PentatonicPositionSelector';
import { PickerModal } from './PickerModal';
import { CogIcon } from './ToolbarIcons';

interface ToolbarControlsProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
}

type OpenModal = 'key' | 'mode' | 'position' | 'options' | null;

export function ToolbarControls({
  state,
  viewModel,
  dispatch,
}: ToolbarControlsProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const keyLabel = getKeyButtonLabel(
    state.selectedNaturalKey,
    state.flatKeyEnabled,
  );
  const modeLabel = viewModel.activeMode.mode.shortName;
  const isPentatonic = viewModel.activeMode.isPentatonic;
  const positionLabel = getPentatonicPositionToolbarLabel(
    state.selectedModeId,
    state.selectedPentatonicPositions,
  );
  const positionAriaLabel = getPentatonicPositionAriaLabel(
    state.selectedModeId,
    state.selectedPentatonicPositions,
  );

  const closeModal = () => setOpenModal(null);

  const handleSelectKey = (key: NaturalKey) => {
    dispatch({ type: 'selectNaturalKey', key });
    closeModal();
  };

  const handleSelectMode = (modeId: string) => {
    dispatch({ type: 'selectMode', modeId });
    closeModal();
  };

  return (
    <>
      <div className="toolbar-picker-group" data-testid="toolbar-controls">
        <button
          type="button"
          className="toolbar-picker-button"
          data-testid="toolbar-key-button"
          aria-haspopup="dialog"
          aria-label={`Key: ${keyLabel}`}
          onClick={() => setOpenModal('key')}
        >
          {keyLabel}
        </button>

        <button
          type="button"
          className="toolbar-picker-button toolbar-picker-button-wide"
          data-testid="toolbar-mode-button"
          aria-haspopup="dialog"
          aria-label={`Mode: ${modeLabel}`}
          onClick={() => setOpenModal('mode')}
        >
          {modeLabel}
        </button>

        {isPentatonic ? (
          <button
            type="button"
            className="toolbar-picker-button"
            data-testid="toolbar-position-button"
            aria-haspopup="dialog"
            aria-label={positionAriaLabel}
            onClick={() => setOpenModal('position')}
          >
            {positionLabel}
          </button>
        ) : null}

        <button
          type="button"
          className="toolbar-icon-button"
          data-testid="toolbar-options-button"
          aria-haspopup="dialog"
          aria-label="Display options"
          title="Display options"
          onClick={() => setOpenModal('options')}
        >
          <CogIcon />
        </button>
      </div>

      <PickerModal
        open={openModal === 'key'}
        title="Key"
        titleId="toolbar-key-modal-title"
        onClose={closeModal}
      >
        <KeySelector
          modal
          selectedNaturalKey={state.selectedNaturalKey}
          flatKeyEnabled={state.flatKeyEnabled}
          onSelectKey={handleSelectKey}
          onToggleFlat={(enabled) => dispatch({ type: 'toggleFlatKey', enabled })}
        />
      </PickerModal>

      <PickerModal
        open={openModal === 'mode'}
        title="Mode"
        titleId="toolbar-mode-modal-title"
        dialogClassName="picker-dialog-mode"
        onClose={closeModal}
      >
        <ModeSelector
          modal
          selectedModeId={state.selectedModeId}
          onSelectMode={handleSelectMode}
        />
      </PickerModal>

      <PickerModal
        open={openModal === 'position'}
        title="Pentatonic position"
        titleId="toolbar-position-modal-title"
        onClose={closeModal}
      >
        <PentatonicPositionSelector
          modal
          modeId={state.selectedModeId}
          visible
          value={state.selectedPentatonicPositions}
          onToggle={(position) =>
            dispatch({ type: 'togglePentatonicPosition', position })
          }
        />
      </PickerModal>

      <PickerModal
        open={openModal === 'options'}
        title="Display options"
        titleId="toolbar-options-modal-title"
        onClose={closeModal}
      >
        <OptionsRow
          modal
          state={state}
          activeMode={viewModel.activeMode}
          isFullNeck={viewModel.fretRange.isFullNeck}
          dispatch={dispatch}
        />
      </PickerModal>
    </>
  );
}
