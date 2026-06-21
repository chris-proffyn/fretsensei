import { getKeyButtonLabel, NATURAL_KEYS, type NaturalKey } from '@fretsensei/utils';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { mobileStyles } from './sharedStyles';

interface KeySelectorProps {
  selectedNaturalKey: NaturalKey;
  flatKeyEnabled: boolean;
  onSelectKey: (key: NaturalKey) => void;
  onToggleFlat: (enabled: boolean) => void;
  mobile?: boolean;
  compact?: boolean;
}

export function KeySelector({
  selectedNaturalKey,
  flatKeyEnabled,
  onSelectKey,
  onToggleFlat,
  mobile = false,
  compact = false,
}: KeySelectorProps) {
  if (mobile) {
    return (
      <View style={styles.mobileRow} accessibilityRole="none">
        <Text style={mobileStyles.sectionLabel}>Key</Text>
        <View style={styles.keyRow} accessibilityRole="radiogroup" accessibilityLabel="Choose key">
          {NATURAL_KEYS.map((key) => {
            const isActive = key.natural === selectedNaturalKey;
            return (
              <Pressable
                key={key.natural}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={getKeyButtonLabel(key.natural, flatKeyEnabled)}
                style={[
                  mobileStyles.keyChip,
                  compact && mobileStyles.keyChipCompact,
                  isActive && mobileStyles.chipActive,
                ]}
                onPress={() => onSelectKey(key.natural)}
              >
                <Text
                  style={[
                    mobileStyles.chipText,
                    compact && mobileStyles.chipTextCompact,
                    isActive && mobileStyles.chipTextActive,
                  ]}
                >
                  {getKeyButtonLabel(key.natural, flatKeyEnabled)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.flatToggle}>
          <Switch
            value={flatKeyEnabled}
            onValueChange={onToggleFlat}
            accessibilityLabel="Flat key spelling"
            trackColor={{ false: colors.line, true: colors.root }}
            style={mobileStyles.switchCompact}
          />
          <Text style={compact ? mobileStyles.optionLabelCompact : mobileStyles.optionLabel}>
            ♭
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  mobileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  flatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginLeft: 2,
  },
});
