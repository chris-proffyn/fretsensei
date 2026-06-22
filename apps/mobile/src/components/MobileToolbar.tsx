import {
  getPlaybackFretWindow,
  getPlaybackStatus,
  type FretboardViewModel,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import type { UseVampControllerReturn } from '../hooks/useVampController';
import { navigateHomeFromPractice } from '../navigation/navigateHomeFromPractice';
import { colors } from '../theme/tokens';
import { LegendToolbarButton } from './LegendToolbarButton';
import { PracticeNavBar } from './navigation/PracticeNavBar';
import { PlaybackControls } from './PlaybackControls';
import { StatusBanner } from './StatusBanner';
import { ToolbarControls } from './ToolbarControls';
import { VampControlButton } from './VampControlButton';

interface MobileToolbarProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
  vamp?: UseVampControllerReturn;
}

export function MobileToolbar({
  state,
  viewModel,
  dispatch,
  playback,
  vamp,
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
  const bannerMessage = vamp?.audioError ?? bpmMessage ?? playbackStatus.message;

  const handleGoHome = useCallback(() => {
    navigateHomeFromPractice({
      stopPlayback: playback.stopPlayback,
      stopVamp: () => dispatch({ type: 'stopVamp' }),
    });
  }, [dispatch, playback.stopPlayback]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.toolbarRow}>
        <ToolbarControls
          state={state}
          viewModel={viewModel}
          dispatch={dispatch}
        />

        {vamp ? (
          <VampControlButton
            isPlaying={vamp.isPlaying}
            dyadLabel={vamp.dyad.displayLabel}
            onToggle={vamp.toggleVamp}
          />
        ) : null}

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
        <PracticeNavBar onPressHome={handleGoHome} />
      </View>

      {bannerMessage ? (
        <StatusBanner status={playbackStatus} bpmMessage={bannerMessage} />
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
