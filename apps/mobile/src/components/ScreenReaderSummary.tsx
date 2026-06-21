import type { FretboardViewModel } from '@fretsensei/utils';
import { StyleSheet, Text, View } from 'react-native';

interface ScreenReaderSummaryProps {
  viewModel: FretboardViewModel;
}

export function ScreenReaderSummary({ viewModel }: ScreenReaderSummaryProps) {
  const { selectedKey, activeMode, scaleMap, positionSummary, fretRange } =
    viewModel;

  const summary = [
    `${selectedKey.displayLabel} ${activeMode.mode.shortName}`,
    `Fret range ${fretRange.summary}`,
    `Scale notes ${scaleMap.map((item) => item.noteName).join(', ')}`,
    `Degrees ${scaleMap.map((item) => item.degree).join(', ')}`,
    positionSummary,
  ].join('. ');

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={summary}>
      <Text style={styles.hidden}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
