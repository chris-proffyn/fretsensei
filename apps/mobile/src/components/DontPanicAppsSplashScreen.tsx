import { Image, StyleSheet, Text, View } from 'react-native';
import { DPA_STUDIO_NAME } from '../constants/brand';

const dpaLogo = require('../../assets/brand/dont-panic-logo.png');

export function DontPanicAppsSplashScreen() {
  return (
    <View
      style={styles.root}
      accessibilityLabel="DontPanicApps launch screen"
    >
      <Image
        source={dpaLogo}
        style={styles.logo}
        accessibilityLabel="DontPanicApps"
      />
      <Text style={styles.studioName}>{DPA_STUDIO_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    zIndex: 20,
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
  },
  studioName: {
    color: '#f4f7fb',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
