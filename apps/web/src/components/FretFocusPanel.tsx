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
import { LegendToolbarButton } from './LegendToolbarButton';
import { ToolbarControls } from './ToolbarControls';

interface FretFocusPanelProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
  isMaximized: boolean;
  onToggleMaximize: () => void;
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
        <ToolbarControls
          state={state}
          viewModel={viewModel}
          dispatch={dispatch}
        />

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

        <div className="playback-toolbar-actions">
          <LegendToolbarButton />

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
    </div>
  );
}
