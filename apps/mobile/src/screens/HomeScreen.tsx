import { HOME_CONTENT } from '@fretsensei/utils';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeActionList } from '../components/home/HomeActionList';
import { HomeLogo } from '../components/home/HomeLogo';
import { colors } from '../theme/tokens';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <HomeLogo />
          <Text style={styles.headline}>{HOME_CONTENT.headline}</Text>
          <Text style={styles.body}>{HOME_CONTENT.body}</Text>
          <HomeActionList />
          <Text style={styles.reassurance}>{HOME_CONTENT.reassurance}</Text>
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    alignItems: 'center',
    gap: 18,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: colors.panel,
  },
  headline: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  reassurance: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 4,
  },
});
