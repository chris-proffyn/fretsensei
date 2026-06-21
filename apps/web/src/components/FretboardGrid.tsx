import {
  MARKER_FRETS,
  STANDARD_TUNING,
  type FretboardNoteCell,
} from '@fretsensei/utils';
import type { ReactNode } from 'react';

const VISUAL_STATE_CLASS: Record<FretboardNoteCell['visualState'], string> = {
  root: 'root',
  scale: 'scale',
  'blue-note': 'blue-note',
  extended: 'extended',
  'extended-root': 'extended-root',
  'out-of-position': 'out-of-position',
  outside: '',
  hidden: 'hidden-note',
};

interface FretboardGridProps {
  cells: FretboardNoteCell[];
  playingCellKey?: string | null;
}

function getCell(
  cells: FretboardNoteCell[],
  stringIndex: number,
  fret: number,
): FretboardNoteCell | undefined {
  return cells.find(
    (cell) => cell.stringIndex === stringIndex && cell.fret === fret,
  );
}

function renderInlay(stringIndex: number, fret: number) {
  if (
    stringIndex === 2 &&
    MARKER_FRETS.has(fret) &&
    fret !== 12 &&
    fret !== 24
  ) {
    return <span className="inlay single" aria-hidden="true" />;
  }

  if ((fret === 12 || fret === 24) && (stringIndex === 1 || stringIndex === 4)) {
    return (
      <span
        className={`inlay double ${stringIndex === 1 ? 'top' : 'bottom'}`}
        aria-hidden="true"
      />
    );
  }

  return null;
}

export function FretboardGrid({ cells, playingCellKey = null }: FretboardGridProps) {
  const rows: ReactNode[] = [
    <div key="corner" className="corner">
      String
    </div>,
  ];

  for (let fret = 0; fret <= 24; fret++) {
    rows.push(
      <div
        key={`label-${fret}`}
        className={`fret-label${MARKER_FRETS.has(fret) ? ' marker' : ''}`}
      >
        {fret === 0 ? 'Open' : fret}
      </div>,
    );
  }

  STANDARD_TUNING.forEach((stringData, stringIndex) => {
    rows.push(
      <div key={`string-${stringIndex}`} className="string-label">
        {stringData.label}
      </div>,
    );

    for (let fret = 0; fret <= 24; fret++) {
      const cell = getCell(cells, stringIndex, fret);
      if (!cell) {
        continue;
      }

      const stateClass = VISUAL_STATE_CLASS[cell.visualState];
      const isPlaying = playingCellKey === cell.cellKey;

      rows.push(
        <div
          key={cell.cellKey}
          className={`cell fret-${cell.fret}`}
          style={{ ['--string-thickness' as string]: stringData.thickness }}
        >
          {renderInlay(stringIndex, cell.fret)}
          {cell.visualState !== 'hidden' ? (
            <span
              className={`note${stateClass ? ` ${stateClass}` : ''}${isPlaying ? ' playing' : ''}`}
              title={cell.title}
              aria-label={cell.title}
            >
              {cell.displayText}
            </span>
          ) : (
            <span className="note hidden-note" aria-hidden="true" />
          )}
        </div>,
      );
    }
  });

  return (
    <div
      className="fretboard"
      data-testid="fretboard-grid"
      aria-label="Guitar fretboard"
    >
      {rows}
    </div>
  );
}
