import type { ActiveModeViewModel, VisualiserState } from '@fretsensei/utils';
import type { UseVisualiserStateReturn } from '../hooks/useVisualiserState';

interface OptionsRowProps {
  state: VisualiserState;
  activeMode: ActiveModeViewModel;
  isFullNeck: boolean;
  dispatch: UseVisualiserStateReturn['dispatch'];
}

export function OptionsRow({
  state,
  activeMode,
  isFullNeck,
  dispatch,
}: OptionsRowProps) {
  const canUseExtended =
    (activeMode.isModal || activeMode.isPentatonic) && !isFullNeck;

  return (
    <div className="options-row" aria-label="Display and pattern options">
      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.includeBlueNote}
          disabled={!activeMode.isPentatonic}
          onChange={(event) =>
            dispatch({ type: 'toggleBlueNote', enabled: event.target.checked })
          }
        />
        <span>Blue note</span>
      </label>

      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.threeNotesPerString}
          disabled={!activeMode.isModal || isFullNeck}
          onChange={(event) =>
            dispatch({
              type: 'toggleThreeNotesPerString',
              enabled: event.target.checked,
            })
          }
        />
        <span>3 notes per string</span>
      </label>

      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.extendedPattern}
          disabled={!canUseExtended}
          onChange={(event) =>
            dispatch({
              type: 'toggleExtendedPattern',
              enabled: event.target.checked,
            })
          }
        />
        <span>Extended pattern</span>
      </label>

      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.limitToOneOctave}
          disabled={isFullNeck}
          onChange={(event) =>
            dispatch({
              type: 'toggleLimitToOneOctave',
              enabled: event.target.checked,
            })
          }
        />
        <span>One octave</span>
      </label>

      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.showScaleDegrees}
          onChange={(event) =>
            dispatch({
              type: 'toggleScaleDegrees',
              enabled: event.target.checked,
            })
          }
        />
        <span>Scale degree</span>
      </label>

      <label className="checkbox-row option-checkbox">
        <input
          type="checkbox"
          checked={state.includeUpperPosition}
          disabled={
            !activeMode.isPentatonic ||
            isFullNeck ||
            state.selectedPentatonicPositions.length === 0
          }
          onChange={(event) =>
            dispatch({
              type: 'toggleIncludeUpperPosition',
              enabled: event.target.checked,
            })
          }
        />
        <span>Include Upper</span>
      </label>
    </div>
  );
}
