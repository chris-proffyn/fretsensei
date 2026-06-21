import type { PentatonicShapePosition } from '@fretsensei/utils';

interface PentatonicPositionSelectorProps {
  visible: boolean;
  value: PentatonicShapePosition[];
  onToggle: (position: PentatonicShapePosition) => void;
}

const POSITIONS: PentatonicShapePosition[] = ['1', '2', '3', '4', '5'];

function getPositionAriaLabel(position: PentatonicShapePosition): string {
  return `Position ${position}`;
}

export function PentatonicPositionSelector({
  visible,
  value,
  onToggle,
}: PentatonicPositionSelectorProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="control-block position-control">
      <label htmlFor="pentatonic-position-buttons">Pentatonic position</label>
      <div
        id="pentatonic-position-buttons"
        className="button-row pentatonic-position-buttons"
        role="group"
        aria-label="Pentatonic position"
      >
        {POSITIONS.map((position) => {
          const isActive = value.includes(position);

          return (
            <button
              key={position}
              type="button"
              aria-pressed={isActive}
              aria-label={getPositionAriaLabel(position)}
              title={getPositionAriaLabel(position)}
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
