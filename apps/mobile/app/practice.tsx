import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VisualiserScreen } from '../src/components/VisualiserScreen';
import { usePlaybackController } from '../src/hooks/usePlaybackController';
import { usePracticeOrientation } from '../src/hooks/usePracticeOrientation';
import { useVisualiserState } from '../src/hooks/useVisualiserState';
import { colors } from '../src/theme/tokens';

export default function PracticeScreen() {
  usePracticeOrientation();

  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({ state, viewModel, dispatch });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <VisualiserScreen
        state={state}
        viewModel={viewModel}
        dispatch={dispatch}
        playback={playback}
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
