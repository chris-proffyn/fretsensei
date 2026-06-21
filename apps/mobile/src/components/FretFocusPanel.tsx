import {
  getPlaybackFretWindow,
  getPlaybackStatus,
  type FretboardViewModel,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { colors } from '../theme/tokens';
import { PlaybackControls } from './PlaybackControls';
import { StatusBanner } from './StatusBanner';
import { sharedStyles } from './sharedStyles';

interface FretFocusPanelProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
  compact?: boolean;
}

export function FretFocusPanel({
  state,
  viewModel,
  dispatch,
  playback,
  compact = false,
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
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <View style={styles.header}>
        <View style={styles.summaryBlock}>
          <Text style={sharedStyles.label}>Fretboard focus</Text>
          <Text
            style={[styles.summary, compact && styles.summaryCompact]}
            accessibilityRole="text"
            accessibilityLabel={`Fretboard focus ${viewModel.fretRange.summary}`}
          >
            {viewModel.fretRange.summary}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Full neck"
          style={[sharedStyles.smallActionButton, compact && styles.fullNeckButton]}
          onPress={() => dispatch({ type: 'setFullNeck' })}
        >
          <Text style={sharedStyles.smallActionButtonText}>Full neck</Text>
        </Pressable>
      </View>

      <StatusBanner status={playbackStatus} bpmMessage={bpmMessage} />

      <PlaybackControls
        compact={compact}
        state={state}
        session={playback.session}
        isPlaying={playback.isPlaying}
        isFullNeck={viewModel.fretRange.isFullNeck}
        onPlay={playback.startPlayback}
        onStop={playback.stopPlayback}
        dispatch={dispatch}
        onBpmMessage={setBpmMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 12,
  },
  panelCompact: {
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  summaryBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  summary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryCompact: {
    fontSize: 14,
  },
  fullNeckButton: {
    paddingHorizontal: 12,
  },
});
