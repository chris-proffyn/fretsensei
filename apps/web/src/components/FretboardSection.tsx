import type { FretboardViewModel, VisualiserAction } from '@fretsensei/utils';
import { useRef, type CSSProperties, type Dispatch } from 'react';
import { useFretboardDisplayScale } from '../fretboard/useFretboardDisplayScale';
import { FretboardGrid } from './FretboardGrid';
import { FretWindowTrack } from './FretWindowTrack';

interface FretboardSectionProps {
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playingCellKey?: string | null;
  maximized?: boolean;
}

export function FretboardSection({
  viewModel,
  dispatch,
  playingCellKey = null,
  maximized = false,
}: FretboardSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const displayScale = useFretboardDisplayScale(
    wrapRef,
    maximized ? 'fit' : 'fill-width',
  );
  const displayStyle = {
    '--fret-scale': displayScale,
  } as CSSProperties;

  return (
    <>
      <p className={`scroll-hint${maximized ? ' is-visible' : ''}`}>
        Scroll sideways to view all 24 frets.
      </p>

      <div
        ref={wrapRef}
        className={`fretboard-wrap${maximized ? ' fretboard-wrap-maximized' : ''}`}
        data-testid="fretboard-wrap"
      >
        <div className="fretboard-display" style={displayStyle}>
          <FretWindowTrack
            start={viewModel.fretRange.start}
            width={viewModel.fretRange.width}
            disabled={viewModel.activeMode.isPentatonic}
            onShowAll={() => dispatch({ type: 'setFullNeck' })}
            onChange={(start, width) =>
              dispatch({ type: 'setFretWindow', start, width })
            }
          />
          <FretboardGrid cells={viewModel.cells} playingCellKey={playingCellKey} />
        </div>
      </div>
    </>
  );
}
