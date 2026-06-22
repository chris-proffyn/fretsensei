import { getKeyButtonLabel, NATURAL_KEYS, type NaturalKey } from '@fretsensei/utils';

interface KeySelectorProps {
  selectedNaturalKey: NaturalKey;
  flatKeyEnabled: boolean;
  onSelectKey: (key: NaturalKey) => void;
  onToggleFlat: (enabled: boolean) => void;
  modal?: boolean;
}

export function KeySelector({
  selectedNaturalKey,
  flatKeyEnabled,
  onSelectKey,
  onToggleFlat,
  modal = false,
}: KeySelectorProps) {
  return (
    <div className={`control-block key-block${modal ? ' modal-picker-block' : ''}`}>
      {!modal ? (
        <div className="control-header">
          <label htmlFor="key-buttons">Key</label>
          <label
            className="checkbox-row compact-checkbox flat-key-toggle"
            aria-label="Flat key spelling"
          >
            <input
              id="flat-key-toggle"
              type="checkbox"
              checked={flatKeyEnabled}
              onChange={(event) => onToggleFlat(event.target.checked)}
            />
            <span className="flat-key-symbol" aria-hidden="true">
              ♭
            </span>
          </label>
        </div>
      ) : (
        <label className="checkbox-row compact-checkbox flat-key-toggle modal-flat-toggle">
          <input
            type="checkbox"
            checked={flatKeyEnabled}
            onChange={(event) => onToggleFlat(event.target.checked)}
          />
          <span>Flat key spelling</span>
          <span className="flat-key-symbol" aria-hidden="true">
            ♭
          </span>
        </label>
      )}
      <div
        id="key-buttons"
        className={`button-row key-buttons${modal ? ' modal-picker-grid' : ''}`}
        role="group"
        aria-label="Choose key"
      >
        {NATURAL_KEYS.map((key) => {
          const isActive = key.natural === selectedNaturalKey;
          return (
            <button
              key={key.natural}
              type="button"
              className={`key-button${isActive ? ' active' : ''}`}
              aria-pressed={isActive}
              onClick={() => onSelectKey(key.natural)}
            >
              {getKeyButtonLabel(key.natural, flatKeyEnabled)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
