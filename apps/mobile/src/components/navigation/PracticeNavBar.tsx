import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/tokens';

interface PracticeNavBarProps {
  onPressHome: () => void;
}

export function PracticeNavBar({ onPressHome }: PracticeNavBarProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Return to homepage"
      style={({ pressed }) => [styles.homeButton, pressed && styles.buttonPressed]}
      onPress={onPressHome}
    >
      <Text style={styles.homeButtonText}>Home</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    height: 30,
    minWidth: 44,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: colors.panelSoft,
    flexShrink: 0,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  homeButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
