import { MODES } from '@fretsensei/utils';

interface ModeSelectorProps {
  selectedModeId: string;
  onSelectMode: (modeId: string) => void;
}

export function ModeSelector({ selectedModeId, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="control-block mode-block">
      <label htmlFor="mode-buttons">Mode</label>
      <div
        id="mode-buttons"
        className="button-row mode-buttons"
        role="group"
        aria-label="Choose mode"
      >
        {MODES.map((mode) => {
          const isActive = mode.id === selectedModeId;
          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-button${isActive ? ' active' : ''}`}
              aria-pressed={isActive}
              onClick={() => onSelectMode(mode.id)}
            >
              {mode.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
