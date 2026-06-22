import {
  getPlaybackFretWindow,
  getPlaybackStatus,
  type FretboardViewModel,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { colors } from '../theme/tokens';
import { PlaybackControls } from './PlaybackControls';
import { StatusBanner } from './StatusBanner';
import { LegendToolbarButton } from './LegendToolbarButton';
import { ToolbarControls } from './ToolbarControls';

interface MobileToolbarProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
}

export function MobileToolbar({
  state,
  viewModel,
  dispatch,
  playback,
}: MobileToolbarProps) {
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
  const bannerMessage = bpmMessage ?? playbackStatus.message;

  return (
    <View style={styles.wrapper}>
      <View style={styles.toolbarRow}>
        <ToolbarControls
          state={state}
          viewModel={viewModel}
          dispatch={dispatch}
        />

        <PlaybackControls
          compact
          state={state}
          session={playback.session}
          isPlaying={playback.isPlaying}
          isFullNeck={viewModel.fretRange.isFullNeck}
          onPlay={playback.startPlayback}
          onStop={playback.stopPlayback}
          dispatch={dispatch}
          onBpmMessage={setBpmMessage}
        />

        <LegendToolbarButton />
      </View>

      {bannerMessage ? (
        <StatusBanner status={playbackStatus} bpmMessage={bpmMessage} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
});
