import type { PentatonicShapePosition } from '@fretsensei/utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mobileStyles } from './sharedStyles';

const POSITIONS: PentatonicShapePosition[] = ['1', '2', '3', '4', '5'];

interface PentatonicPositionSelectorProps {
  visible: boolean;
  value: PentatonicShapePosition[];
  onToggle: (position: PentatonicShapePosition) => void;
  compact?: boolean;
}

function getPositionAriaLabel(position: PentatonicShapePosition): string {
  return `Position ${position}`;
}

export function PentatonicPositionSelector({
  visible,
  value,
  onToggle,
  compact = false,
}: PentatonicPositionSelectorProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={mobileStyles.sectionLabel}>Pos</Text>
      <View
        style={styles.buttonRow}
        accessibilityRole="none"
        accessibilityLabel="Pentatonic position"
      >
        {POSITIONS.map((position) => {
          const isActive = value.includes(position);
          return (
            <Pressable
              key={position}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={getPositionAriaLabel(position)}
              style={[
                styles.positionButton,
                compact && styles.positionButtonCompact,
                isActive && mobileStyles.chipActive,
              ]}
              onPress={() => onToggle(position)}
            >
              <Text
                style={[
                  mobileStyles.chipText,
                  compact && mobileStyles.chipTextCompact,
                  isActive && mobileStyles.chipTextActive,
                ]}
              >
                {position}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  positionButton: {
    ...mobileStyles.chip,
    minWidth: 36,
  },
  positionButtonCompact: {
    ...mobileStyles.chipCompact,
    minWidth: 28,
    minHeight: 28,
  },
});
