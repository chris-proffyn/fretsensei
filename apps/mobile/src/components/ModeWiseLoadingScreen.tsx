import { APP_TITLE } from '@fretsensei/utils';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { MODEWISE_LOADING_LABEL } from '../constants/brand';
import { colors } from '../theme/tokens';

const modeWiseLogo = require('../../assets/brand/ModeWise_1024.png');

export function ModeWiseLoadingScreen() {
  return (
    <View
      style={styles.root}
      accessibilityLabel="ModeWise loading screen"
    >
      <View style={styles.hero}>
        <Image
          source={modeWiseLogo}
          style={styles.logo}
          accessibilityLabel="ModeWise"
        />
        <Text style={styles.tagline}>{APP_TITLE}</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.root} size="small" />
          <Text style={styles.loadingLabel}>{MODEWISE_LOADING_LABEL}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 520,
    paddingHorizontal: 32,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  tagline: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  loadingLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
