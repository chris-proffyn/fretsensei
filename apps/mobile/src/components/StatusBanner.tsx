import type { PlaybackStatus } from '@fretsensei/utils';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

interface StatusBannerProps {
  status: PlaybackStatus;
  bpmMessage?: string | null;
}

export function StatusBanner({ status, bpmMessage }: StatusBannerProps) {
  const message = bpmMessage ?? status.message;

  if (!message) {
    return null;
  }

  return (
    <View
      style={styles.banner}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 176, 32, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.28)',
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
