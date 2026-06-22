import type { ActiveModeViewModel, VisualiserState } from '@fretsensei/utils';
import type { UseVisualiserStateReturn } from '../hooks/useVisualiserState';

interface OptionsRowProps {
  state: VisualiserState;
  activeMode: ActiveModeViewModel;
  isFullNeck: boolean;
  dispatch: UseVisualiserStateReturn['dispatch'];
  modal?: boolean;
}

export function OptionsRow({
  state,
  activeMode,
  isFullNeck,
  dispatch,
  modal = false,
}: OptionsRowProps) {
  const canUseExtended =
    (activeMode.isModal || activeMode.isPentatonic) && !isFullNeck;

  return (
    <div
      className={`options-row${modal ? ' modal-options-row' : ''}`}
      aria-label="Display and pattern options"
    >
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
        {modal ? <span className="option-short-label">3NPS</span> : null}
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
        {modal ? <span className="option-short-label">Ext</span> : null}
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
        {modal ? <span className="option-short-label">1Oct</span> : null}
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
        {modal ? <span className="option-short-label">Degree</span> : null}
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
        {modal ? <span className="option-short-label">Upper</span> : null}
      </label>
    </div>
  );
}
