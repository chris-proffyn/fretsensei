import {
  getFretWindowTrackLabel,
  MAX_FRET,
  MIN_FRET,
} from '@fretsensei/utils';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface FretWindowTrackProps {
  start: number;
  width: number;
  disabled?: boolean;
  onChange: (start: number, width: number) => void;
  onShowAll?: () => void;
}

type DragMode = 'move' | 'left' | 'right';

interface DragState {
  mode: DragMode;
  startClientX: number;
  originalStart: number;
  originalWidth: number;
}

export function FretWindowTrack({
  start,
  width,
  disabled = false,
  onChange,
  onShowAll,
}: FretWindowTrackProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [thumbStyle, setThumbStyle] = useState({ left: 0, width: 0 });
  const [dragClass, setDragClass] = useState('');

  const end = Math.min(MAX_FRET, start + width - 1);
  const label = getFretWindowTrackLabel(start, width);

  const updateThumbPosition = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const cells = grid.querySelectorAll<HTMLElement>('.fret-window-track-cell');
    const startCell = cells[start];
    const endCell = cells[end];

    if (!startCell || !endCell) {
      return;
    }

    setThumbStyle({
      left: startCell.offsetLeft,
      width: endCell.offsetLeft + endCell.offsetWidth - startCell.offsetLeft,
    });
  }, [start, end]);

  useLayoutEffect(() => {
    updateThumbPosition();
  }, [updateThumbPosition]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateThumbPosition();
    });
    observer.observe(grid);

    return () => observer.disconnect();
  }, [updateThumbPosition]);

  const getCellWidth = () => {
    const firstCell = gridRef.current?.querySelector<HTMLElement>(
      '.fret-window-track-cell',
    );
    return firstCell?.getBoundingClientRect().width ?? 1;
  };

  const applyDrag = (clientX: number) => {
    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    const delta = Math.round(
      (clientX - dragState.startClientX) / getCellWidth(),
    );

    if (dragState.mode === 'move') {
      const maxStart = Math.max(MIN_FRET, 25 - dragState.originalWidth);
      const nextStart = Math.max(
        MIN_FRET,
        Math.min(maxStart, dragState.originalStart + delta),
      );
      onChange(nextStart, dragState.originalWidth);
      return;
    }

    if (dragState.mode === 'left') {
      const originalEnd = dragState.originalStart + dragState.originalWidth - 1;
      const newStart = Math.max(
        MIN_FRET,
        Math.min(originalEnd - 2, dragState.originalStart + delta),
      );
      onChange(newStart, originalEnd - newStart + 1);
      return;
    }

    const newEnd = Math.max(
      dragState.originalStart + 2,
      Math.min(
        MAX_FRET,
        dragState.originalStart + dragState.originalWidth - 1 + delta,
      ),
    );
    onChange(dragState.originalStart, newEnd - dragState.originalStart + 1);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();

    const target = event.target as HTMLElement;
    const edge = target.dataset.resizeEdge ?? 'move';
    const mode: DragMode =
      edge === 'left' ? 'left' : edge === 'right' ? 'right' : 'move';

    dragStateRef.current = {
      mode,
      startClientX: event.clientX,
      originalStart: start,
      originalWidth: width,
    };
    setDragClass(mode === 'move' ? 'dragging' : 'resizing');
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current) {
      return;
    }

    applyDrag(event.clientX);
  };

  const stopDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStateRef.current = null;
    setDragClass('');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={`fret-window-track${disabled ? ' is-disabled' : ''}`}
      aria-label="Fret window selector"
      aria-disabled={disabled || undefined}
    >
      <div ref={gridRef} className="fret-window-track-grid">
        <button
          type="button"
          className="fret-window-track-all-button"
          aria-label="Show all frets"
          disabled={disabled}
          onClick={onShowAll}
        >
          All
        </button>
        {Array.from({ length: MAX_FRET + 1 }, (_, fret) => (
          <button
            key={fret}
            type="button"
            className="fret-window-track-cell"
            aria-label={`Set fret window start to ${fret}`}
            disabled={disabled}
            onClick={() => {
              if (disabled) {
                return;
              }

              if (start === 0 && width >= 25) {
                onChange(fret, 4);
                return;
              }

              onChange(Math.min(fret, 25 - width), width);
            }}
          >
            {fret}
          </button>
        ))}
      </div>
      <button
        ref={thumbRef}
        type="button"
        className={`fret-window-thumb${dragClass ? ` ${dragClass}` : ''}`}
        style={{ left: thumbStyle.left, width: thumbStyle.width }}
        aria-label={`Selected fret range ${label}`}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <span className="fret-window-resize-handle left" data-resize-edge="left" />
        <span className="fret-window-thumb-label">{label}</span>
        <span className="fret-window-resize-handle right" data-resize-edge="right" />
      </button>
    </div>
  );
}
