import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

const LEGEND_ITEMS = [
  { label: 'Root', color: colors.root, dashed: false },
  { label: 'In scale', color: colors.keyNote, dashed: false },
  { label: 'Blue note', color: colors.blueNote, dashed: false },
  { label: 'Extended', color: colors.panelSoft, dashed: true, border: colors.root },
  { label: 'Out of position', color: colors.panelSoft, dashed: false, muted: true },
];

interface LegendProps {
  compact?: boolean;
  showTitle?: boolean;
}

export function Legend({ compact = false, showTitle = true }: LegendProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      {showTitle ? <Text style={styles.title}>Legend</Text> : null}
      <View style={styles.items}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.item}>
            <View
              style={[
                styles.swatch,
                compact && styles.swatchCompact,
                { backgroundColor: item.color },
                item.dashed && styles.swatchDashed,
                item.border ? { borderColor: item.border } : null,
                item.muted ? styles.swatchMuted : null,
              ]}
            />
            <Text style={[styles.label, compact && styles.labelCompact]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },
  swatchCompact: {
    width: 14,
    height: 14,
  },
  swatchDashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  swatchMuted: {
    opacity: 0.72,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 11,
  },
});
