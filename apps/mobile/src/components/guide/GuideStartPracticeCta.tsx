import { HOW_TO_GUIDE_INTRO } from '@fretsensei/utils';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';

interface GuideStartPracticeCtaProps {
  bottom?: boolean;
}

export function GuideStartPracticeCta({ bottom = false }: GuideStartPracticeCtaProps) {
  return (
    <View style={[styles.row, bottom && styles.rowBottom]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={HOW_TO_GUIDE_INTRO.startPracticeLabel}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => router.push('/practice')}
      >
        <Text style={styles.buttonText}>{HOW_TO_GUIDE_INTRO.startPracticeLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 4,
  },
  rowBottom: {
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.root,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: colors.rootText,
    fontSize: 17,
    fontWeight: '800',
  },
});
