import { getKeyButtonLabel, NATURAL_KEYS, type NaturalKey } from '@fretsensei/utils';

interface KeySelectorProps {
  selectedNaturalKey: NaturalKey;
  flatKeyEnabled: boolean;
  onSelectKey: (key: NaturalKey) => void;
  onToggleFlat: (enabled: boolean) => void;
}

export function KeySelector({
  selectedNaturalKey,
  flatKeyEnabled,
  onSelectKey,
  onToggleFlat,
}: KeySelectorProps) {
  return (
    <div className="control-block key-block">
      <div className="control-header">
        <label htmlFor="key-buttons">Key</label>
        <label className="checkbox-row compact-checkbox flat-key-toggle" aria-label="Flat key spelling">
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
      <div
        id="key-buttons"
        className="button-row key-buttons"
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
