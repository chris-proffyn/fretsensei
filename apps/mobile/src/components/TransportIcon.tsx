import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

interface TransportIconProps {
  variant: 'play' | 'stop';
  tone?: string;
  size?: number;
}

export function TransportIcon({
  variant,
  tone = colors.text,
  size = 16,
}: TransportIconProps) {
  return (
    <Text
      style={[styles.icon, { color: tone, fontSize: size, lineHeight: size + 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {variant === 'play' ? '▶' : '■'}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },
});
