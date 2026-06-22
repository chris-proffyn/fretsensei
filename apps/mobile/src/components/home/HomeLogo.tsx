import { Image, StyleSheet } from 'react-native';

const modeWiseLogo = require('../../../assets/brand/ModeWise_1024.png');

export function HomeLogo() {
  return (
    <Image
      source={modeWiseLogo}
      style={styles.logo}
      accessibilityLabel="ModeWise"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});
