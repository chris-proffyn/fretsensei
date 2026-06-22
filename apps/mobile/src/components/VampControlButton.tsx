import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

interface VampControlButtonProps {
  isPlaying: boolean;
  dyadLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}

export function VampControlButton({
  isPlaying,
  dyadLabel,
  onToggle,
  disabled = false,
}: VampControlButtonProps) {
  const buttonLabel = isPlaying ? 'Stop' : 'Vamp';

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: isPlaying }}
        accessibilityLabel={isPlaying ? `Stop ${dyadLabel}` : `Start ${dyadLabel}`}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          isPlaying && styles.buttonActive,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onToggle}
      >
        <Text style={[styles.buttonText, isPlaying && styles.buttonTextActive]}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexShrink: 0,
  },
  button: {
    minHeight: 30,
    minWidth: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.root,
    borderColor: colors.root,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  buttonTextActive: {
    color: colors.rootText,
  },
});
