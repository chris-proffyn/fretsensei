import {
  getVisibleHomeActions,
  HOME_ACTIONS,
  HOME_SECONDARY_ACTION,
} from '@fretsensei/utils';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';

export function HomeActionList() {
  const visibleActions = getVisibleHomeActions(HOME_ACTIONS);

  return (
    <View
      style={styles.actions}
      accessibilityRole="none"
      accessibilityLabel="Homepage actions"
    >
      {visibleActions.map((action) => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={() => router.push(action.route)}
        >
          <Text style={styles.primaryButtonText}>{action.label}</Text>
        </Pressable>
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={HOME_SECONDARY_ACTION.label}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
        ]}
        onPress={() => router.push(HOME_SECONDARY_ACTION.route)}
      >
        <Text style={styles.secondaryButtonText}>{HOME_SECONDARY_ACTION.label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.root,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: colors.rootText,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: colors.blueNote,
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
