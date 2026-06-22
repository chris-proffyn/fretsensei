import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

export function CogIcon({ size = 16, color = colors.text }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.cogCenter, { borderColor: color }]} />
      <View style={[styles.cogRay, styles.cogRayTop, { backgroundColor: color }]} />
      <View style={[styles.cogRay, styles.cogRayBottom, { backgroundColor: color }]} />
      <View style={[styles.cogRay, styles.cogRayLeft, { backgroundColor: color }]} />
      <View style={[styles.cogRay, styles.cogRayRight, { backgroundColor: color }]} />
    </View>
  );
}

export function LegendIcon({ size = 16, color = colors.text }: IconProps) {
  return (
    <View style={[styles.legendIcon, { width: size, height: size }]}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <View style={[styles.legendLine, { backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cogCenter: {
    width: 6,
    height: 6,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  cogRay: {
    position: 'absolute',
    width: 1.5,
    height: 3,
    borderRadius: 1,
  },
  cogRayTop: {
    top: 0,
  },
  cogRayBottom: {
    bottom: 0,
  },
  cogRayLeft: {
    left: 1,
    transform: [{ rotate: '90deg' }],
  },
  cogRayRight: {
    right: 1,
    transform: [{ rotate: '90deg' }],
  },
  legendIcon: {
    justifyContent: 'space-between',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  legendDot: {
    width: 2,
    height: 2,
    borderRadius: 999,
  },
  legendLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
  },
});
