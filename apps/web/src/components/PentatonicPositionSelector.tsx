import {
  getPentatonicPositionButtonAriaLabel,
  getPentatonicPositionsForMode,
  type PentatonicShapePosition,
} from '@fretsensei/utils';

interface PentatonicPositionSelectorProps {
  modeId: string;
  visible: boolean;
  value: PentatonicShapePosition[];
  onToggle: (position: PentatonicShapePosition) => void;
  modal?: boolean;
}

export function PentatonicPositionSelector({
  modeId,
  visible,
  value,
  onToggle,
  modal = false,
}: PentatonicPositionSelectorProps) {
  if (!visible) {
    return null;
  }

  const positions = getPentatonicPositionsForMode(modeId);

  return (
    <div
      className={`control-block position-control${modal ? ' modal-picker-block' : ''}`}
    >
      {!modal ? (
        <label htmlFor="pentatonic-position-buttons">Pentatonic position</label>
      ) : (
        <p className="picker-modal-hint">
          Select one or more positions. Tap again to deselect.
        </p>
      )}
      <div
        id="pentatonic-position-buttons"
        className={`button-row pentatonic-position-buttons${modal ? ' modal-picker-grid' : ''}`}
        role="group"
        aria-label="Pentatonic position"
      >
        {positions.map((position) => {
          const isActive = value.includes(position);

          return (
            <button
              key={position}
              type="button"
              aria-pressed={isActive}
              aria-label={getPentatonicPositionButtonAriaLabel(position)}
              title={getPentatonicPositionButtonAriaLabel(position)}
              data-position={position}
              className={`position-button${isActive ? ' active' : ''}`}
              onClick={() => onToggle(position)}
            >
              {position}
            </button>
          );
        })}
      </div>
    </div>
  );
}
