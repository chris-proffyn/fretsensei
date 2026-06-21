import { StyleSheet, Text, View } from 'react-native';
import { PACKAGE_NAME as uiPackage } from '@fretsensei/ui';
import { PACKAGE_NAME as utilsPackage } from '@fretsensei/utils';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>FretSensei</Text>
      <Text style={styles.title}>Guitar fretboard visualiser</Text>
      <Text style={styles.subtitle}>
        Explore scales, modes, and fretboard patterns across a standard-tuned
        24-fret guitar neck.
      </Text>
      <Text style={styles.status}>
        Bootstrap complete — visualiser UI coming in Milestone 4.
      </Text>
      <Text style={styles.meta}>
        Packages: {uiPackage}, {utilsPackage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 24,
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#f59e0b',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 16,
    lineHeight: 24,
  },
  status: {
    color: '#737373',
    fontSize: 15,
    marginTop: 24,
  },
  meta: {
    color: '#525252',
    fontSize: 13,
    marginTop: 8,
  },
});
