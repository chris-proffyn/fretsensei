import {
  getPlaybackFretWindow,
  getPlaybackStatus,
  type FretboardViewModel,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { PanelToggleIcon } from './PanelToggleIcon';
import { PlaybackControls } from './PlaybackControls';
import { StatusBanner } from './StatusBanner';

interface FretFocusPanelProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

function getPlaybackSummary(viewModel: FretboardViewModel): string {
  return `${viewModel.selectedKey.displayLabel} ${viewModel.activeMode.mode.shortName}`;
}

export function FretFocusPanel({
  state,
  viewModel,
  dispatch,
  playback,
  isMaximized,
  onToggleMaximize,
}: FretFocusPanelProps) {
  const [bpmMessage, setBpmMessage] = useState<string | null>(null);
  const playbackSummary = getPlaybackSummary(viewModel);
  const playbackStatus = getPlaybackStatus(
    viewModel.cells,
    viewModel.fretRange.isFullNeck,
    playback.audioUnavailable,
    getPlaybackFretWindow(
      viewModel.fretRange.start,
      viewModel.fretRange.end,
      viewModel.fretRange.isFullNeck,
    ),
    state.extendedPattern,
  );

  return (
    <div className="fret-window-control" data-testid="playback-panel">
      <StatusBanner status={playbackStatus} bpmMessage={bpmMessage} />

      <div className="playback-toolbar">
        <p className="fret-window-summary" data-testid="playback-panel-summary">
          {playbackSummary}
        </p>

        <PlaybackControls
          state={state}
          session={playback.session}
          isPlaying={playback.isPlaying}
          isFullNeck={viewModel.fretRange.isFullNeck}
          onPlay={playback.startPlayback}
          onStop={playback.stopPlayback}
          dispatch={dispatch}
          onBpmMessage={setBpmMessage}
        />

        <button
          type="button"
          className="playback-panel-toggle"
          data-testid="playback-panel-toggle"
          aria-expanded={isMaximized}
          aria-controls="fretboard-maximized-overlay"
          aria-label={
            isMaximized ? 'Minimize fretboard view' : 'Maximize fretboard view'
          }
          title={isMaximized ? 'Minimize fretboard view' : 'Maximize fretboard view'}
          onClick={onToggleMaximize}
        >
          <PanelToggleIcon expanded={isMaximized} />
        </button>
      </div>
    </div>
  );
}
