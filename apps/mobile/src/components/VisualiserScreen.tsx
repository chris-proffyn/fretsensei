import type { FretboardViewModel, VisualiserAction, VisualiserState } from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { useMobileLayout } from '../hooks/useMobileLayout';
import { colors } from '../theme/tokens';
import { FretboardGrid } from './FretboardGrid';
import { MobileToolbar } from './MobileToolbar';
import { ScreenReaderSummary } from './ScreenReaderSummary';

interface VisualiserScreenProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
}

export function VisualiserScreen({
  state,
  viewModel,
  dispatch,
  playback,
}: VisualiserScreenProps) {
  const { fretLayout, fretboardWidth, fretboardHeight } = useMobileLayout();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [fretTrackInteracting, setFretTrackInteracting] = useState(false);
  const fretboardScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (fretTrackInteracting) {
      return;
    }

    const scrollX = Math.max(
      0,
      viewModel.fretRange.start * fretLayout.fretCellWidth - fretLayout.fretCellWidth,
    );

    fretboardScrollRef.current?.scrollTo({ x: scrollX, animated: true });
  }, [
    fretLayout.fretCellWidth,
    fretTrackInteracting,
    viewModel.fretRange.start,
    viewModel.fretRange.width,
    viewModel.activeMode.isPentatonic,
    state.selectedPentatonicPositions.join(','),
    state.selectedNaturalKey,
    state.selectedModeId,
  ]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scrollContent,
        isLandscape && styles.scrollContentLandscape,
      ]}
      showsVerticalScrollIndicator
      scrollEnabled={!fretTrackInteracting}
      nestedScrollEnabled
    >
      <ScreenReaderSummary viewModel={viewModel} />

      <MobileToolbar
        state={state}
        viewModel={viewModel}
        dispatch={dispatch}
        playback={playback}
      />

      <View style={styles.fretboardSection}>
        {!isLandscape ? (
          <Text style={styles.scrollHint}>Scroll sideways to view all frets.</Text>
        ) : null}
        <ScrollView
          ref={fretboardScrollRef}
          horizontal
          showsHorizontalScrollIndicator
          scrollEnabled={!fretTrackInteracting}
          nestedScrollEnabled
          style={[styles.fretboardViewport, { height: fretboardHeight }]}
          contentContainerStyle={styles.fretboardScrollContent}
        >
          <View
            style={[
              styles.fretboardContent,
              { width: fretboardWidth, height: fretboardHeight },
            ]}
          >
            <FretboardGrid
              cells={viewModel.cells}
              playingCellKey={playback.playingCellKey}
              fretLayout={fretLayout}
              fretWindow={{
                start: viewModel.fretRange.start,
                width: viewModel.fretRange.width,
                disabled: viewModel.activeMode.isPentatonic,
                onInteractionChange: setFretTrackInteracting,
                onChange: (start, width) =>
                  dispatch({ type: 'setFretWindow', start, width }),
              }}
            />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  scrollContentLandscape: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  fretboardSection: {
    gap: 6,
  },
  fretboardViewport: {
    flexGrow: 0,
  },
  scrollHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  fretboardScrollContent: {
    alignItems: 'flex-start',
  },
  fretboardContent: {
    flexShrink: 0,
  },
});
