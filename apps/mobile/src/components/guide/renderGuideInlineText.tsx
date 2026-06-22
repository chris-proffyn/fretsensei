import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/tokens';

const INLINE_STRONG_PATTERN = /(\*\*[^*]+\*\*)/g;

export function renderGuideInlineText(text: string): ReactNode[] {
  return text.split(INLINE_STRONG_PATTERN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.strong}>
          {part.slice(2, -2)}
        </Text>
      );
    }

    return part;
  });
}

const styles = StyleSheet.create({
  strong: {
    fontWeight: '800',
    color: colors.text,
  },
});
