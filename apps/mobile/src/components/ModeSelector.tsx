import { MODES } from '@fretsensei/utils';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMobileModeLabel } from '../constants/mobileLabels';
import { mobileStyles } from './sharedStyles';

interface ModeSelectorProps {
  selectedModeId: string;
  onSelectMode: (modeId: string) => void;
  mobile?: boolean;
  compact?: boolean;
}

export function ModeSelector({
  selectedModeId,
  onSelectMode,
  mobile = false,
  compact = false,
}: ModeSelectorProps) {
  if (!mobile) {
    return null;
  }

  const chips = MODES.map((mode) => {
    const isActive = mode.id === selectedModeId;
    const label = compact
      ? getMobileModeLabel(mode.id, mode.shortName)
      : mode.shortName;

    return (
      <Pressable
        key={mode.id}
        accessibilityRole="radio"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={mode.shortName}
        style={[
          mobileStyles.chip,
          compact && mobileStyles.chipCompact,
          isActive && mobileStyles.chipActive,
        ]}
        onPress={() => onSelectMode(mode.id)}
      >
        <Text
          style={[
            mobileStyles.chipText,
            compact && mobileStyles.chipTextCompact,
            isActive && mobileStyles.chipTextActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={styles.block}>
      <Text style={mobileStyles.sectionLabel}>Mode</Text>
      {compact ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose mode"
        >
          {chips}
        </ScrollView>
      ) : (
        <View
          style={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose mode"
        >
          {chips}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 4,
  },
});
