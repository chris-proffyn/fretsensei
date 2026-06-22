import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VisualiserScreen } from '../src/components/VisualiserScreen';
import { isOneChordVampEnabled } from '../src/config/build-feature-flags';
import { usePlaybackController } from '../src/hooks/usePlaybackController';
import { usePracticeOrientation } from '../src/hooks/usePracticeOrientation';
import { useVampController } from '../src/hooks/useVampController';
import { useVisualiserState } from '../src/hooks/useVisualiserState';
import { colors } from '../src/theme/tokens';

export default function PracticeScreen() {
  usePracticeOrientation();

  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({ state, viewModel, dispatch });
  const vampEnabled = isOneChordVampEnabled();
  const vamp = useVampController({
    enabled: vampEnabled,
    state,
    viewModel,
    dispatch,
  });

  useEffect(
    () => () => {
      dispatch({ type: 'stopVamp' });
    },
    [dispatch],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <VisualiserScreen
        state={state}
        viewModel={viewModel}
        dispatch={dispatch}
        playback={playback}
        vamp={vampEnabled && vamp.isSupported ? vamp : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
