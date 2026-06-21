import { StyleSheet, View } from 'react-native';

interface RepeatIconProps {
  tone: string;
  size?: number;
}

/** Loop/repeat icon drawn with views — avoids @expo/vector-icons / expo-font. */
export function RepeatIcon({ tone, size = 14 }: RepeatIconProps) {
  const stroke = Math.max(1.5, size * 0.11);
  const arcW = size * 0.72;
  const arcH = size * 0.38;
  const arrow = stroke * 1.35;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.arc,
          {
            width: arcW,
            height: arcH,
            borderColor: tone,
            borderWidth: stroke,
            borderBottomWidth: 0,
            borderTopLeftRadius: arcW / 2,
            borderTopRightRadius: arcW / 2,
            top: size * 0.08,
            left: size * 0.14,
          },
        ]}
      />
      <View
        style={[
          styles.arrow,
          {
            borderBottomColor: tone,
            top: size * 0.04,
            right: size * 0.1,
            borderBottomWidth: arrow,
            borderLeftWidth: arrow,
          },
        ]}
      />
      <View
        style={[
          styles.arc,
          {
            width: arcW,
            height: arcH,
            borderColor: tone,
            borderWidth: stroke,
            borderTopWidth: 0,
            borderBottomLeftRadius: arcW / 2,
            borderBottomRightRadius: arcW / 2,
            bottom: size * 0.08,
            right: size * 0.14,
          },
        ]}
      />
      <View
        style={[
          styles.arrow,
          {
            borderTopColor: tone,
            bottom: size * 0.04,
            left: size * 0.1,
            borderTopWidth: arrow,
            borderRightWidth: arrow,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  arc: {
    position: 'absolute',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderColor: 'transparent',
  },
});
