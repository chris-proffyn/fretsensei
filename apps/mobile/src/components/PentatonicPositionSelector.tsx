import {
  getPentatonicPositionButtonAriaLabel,
  getPentatonicPositionsForMode,
  type PentatonicShapePosition,
} from '@fretsensei/utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mobileStyles } from './sharedStyles';

interface PentatonicPositionSelectorProps {
  modeId: string;
  visible: boolean;
  value: PentatonicShapePosition[];
  onToggle: (position: PentatonicShapePosition) => void;
  modal?: boolean;
}

export function PentatonicPositionSelector({
  modeId,
  visible,
  value,
  onToggle,
  modal = false,
}: PentatonicPositionSelectorProps) {
  if (!visible) {
    return null;
  }

  const positions = getPentatonicPositionsForMode(modeId);

  return (
    <View style={[styles.container, modal && styles.modalContainer]}>
      {!modal ? <Text style={mobileStyles.sectionLabel}>Pos</Text> : null}
      <View
        style={styles.buttonRow}
        accessibilityRole="none"
        accessibilityLabel="Pentatonic position"
      >
        {positions.map((position) => {
          const isActive = value.includes(position);
          return (
            <Pressable
              key={position}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={getPentatonicPositionButtonAriaLabel(position)}
              style={[
                styles.positionButton,
                modal && styles.positionButtonModal,
                isActive && mobileStyles.chipActive,
              ]}
              onPress={() => onToggle(position)}
            >
              <Text
                style={[
                  mobileStyles.chipText,
                  modal && styles.positionButtonTextModal,
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
  modalContainer: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  positionButton: {
    ...mobileStyles.chip,
    minWidth: 36,
  },
  positionButtonModal: {
    ...mobileStyles.chipCompact,
    minWidth: 44,
    minHeight: 40,
  },
  positionButtonTextModal: {
    fontSize: 15,
    fontWeight: '800',
  },
});
