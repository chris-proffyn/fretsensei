import type { GuideBlock, GuideBlockTone, GuideSection } from '@fretsensei/utils';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { renderGuideInlineText } from './renderGuideInlineText';

function calloutStyles(tone: GuideBlockTone = 'info') {
  switch (tone) {
    case 'warning':
      return styles.calloutWarning;
    case 'tip':
      return styles.calloutTip;
    default:
      return styles.calloutInfo;
  }
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          {renderGuideInlineText(block.text ?? '')}
        </Text>
      );
    case 'bullets':
      return (
        <View style={styles.list}>
          {(block.items ?? []).map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.bulletMarker}>•</Text>
              <Text style={styles.listItemText}>{renderGuideInlineText(item)}</Text>
            </View>
          ))}
        </View>
      );
    case 'steps':
      return (
        <View style={styles.list}>
          {(block.items ?? []).map((item, index) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.stepMarker}>{index + 1}.</Text>
              <Text style={styles.listItemText}>{renderGuideInlineText(item)}</Text>
            </View>
          ))}
        </View>
      );
    case 'callout':
      return (
        <Text style={[styles.callout, calloutStyles(block.tone)]}>
          {renderGuideInlineText(block.text ?? '')}
        </Text>
      );
    default:
      return null;
  }
}

interface GuideArticleProps {
  sections: GuideSection[];
}

export function GuideArticle({ sections }: GuideArticleProps) {
  return (
    <View style={styles.article}>
      {sections.map((section) => (
        <View
          key={section.id}
          style={styles.section}
          accessibilityRole="none"
          accessibilityLabel={section.title}
        >
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {section.title}
          </Text>
          {section.body.map((block, index) => (
            <GuideBlockView key={`${section.id}-${index}`} block={block} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  article: {
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  paragraph: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletMarker: {
    color: colors.blueNote,
    fontSize: 16,
    lineHeight: 24,
    width: 14,
  },
  stepMarker: {
    color: colors.blueNote,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
    width: 22,
  },
  listItemText: {
    flex: 1,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  callout: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  calloutInfo: {
    color: colors.muted,
    backgroundColor: 'rgba(77, 163, 255, 0.08)',
    borderColor: 'rgba(77, 163, 255, 0.24)',
  },
  calloutTip: {
    color: colors.muted,
    backgroundColor: 'rgba(88, 196, 114, 0.08)',
    borderColor: 'rgba(88, 196, 114, 0.24)',
  },
  calloutWarning: {
    color: colors.muted,
    backgroundColor: 'rgba(255, 176, 32, 0.08)',
    borderColor: 'rgba(255, 176, 32, 0.24)',
  },
});
