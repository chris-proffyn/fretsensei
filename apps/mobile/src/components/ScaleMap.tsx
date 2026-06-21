import type { ScaleMapItem } from '@fretsensei/utils';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { mobileStyles } from './sharedStyles';

interface ScaleMapProps {
  items: ScaleMapItem[];
  inline?: boolean;
}

export function ScaleMap({ items, inline = false }: ScaleMapProps) {
  if (inline) {
    return (
      <View
        style={styles.inlineRow}
        accessibilityRole="summary"
        accessibilityLabel="Scale interval and note map"
      >
        <Text style={mobileStyles.sectionLabel}>Map</Text>
        <View style={styles.items}>
          {items.map((item) => (
            <View key={`${item.degree}-${item.noteName}`} style={styles.item}>
              <Text style={styles.degree}>{item.degree}</Text>
              <Text style={styles.note}>{item.noteName}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.block}
      accessibilityRole="summary"
      accessibilityLabel="Scale interval and note map"
    >
      <Text style={mobileStyles.sectionLabel}>Scale map</Text>
      <View style={styles.items}>
        {items.map((item) => (
          <View key={`${item.degree}-${item.noteName}`} style={styles.item}>
            <Text style={styles.degree}>{item.degree}</Text>
            <Text style={styles.note}>{item.noteName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  item: {
    minWidth: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.panelSoft,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  degree: {
    color: colors.root,
    fontSize: 10,
    fontWeight: '900',
  },
  note: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
