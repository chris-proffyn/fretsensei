import {
  filterGuideSections,
  HOW_TO_GUIDE_INTRO,
  HOW_TO_GUIDE_SECTIONS,
} from '@fretsensei/utils';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuideArticle } from '../components/guide/GuideArticle';
import { GuideStartPracticeCta } from '../components/guide/GuideStartPracticeCta';
import { colors } from '../theme/tokens';

export function HowToScreen() {
  const sections = filterGuideSections(HOW_TO_GUIDE_SECTIONS, {
    platform: 'mobile',
    tier: 'free',
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to homepage"
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backLink}>← Home</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {HOW_TO_GUIDE_INTRO.title}
          </Text>
          <Text style={styles.intro}>{HOW_TO_GUIDE_INTRO.intro}</Text>
        </View>

        <GuideStartPracticeCta />
        <GuideArticle sections={sections} />
        <GuideStartPracticeCta bottom />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
    paddingBottom: 40,
  },
  backLink: {
    color: colors.blueNote,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  header: {
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  intro: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
});
