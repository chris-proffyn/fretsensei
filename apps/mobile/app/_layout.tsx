import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { DontPanicAppsSplashScreen } from '../src/components/DontPanicAppsSplashScreen';
import { ModeWiseLoadingScreen } from '../src/components/ModeWiseLoadingScreen';
import { useLaunchSplash } from '../src/hooks/useLaunchSplash';

export default function RootLayout() {
  const { phase, onLayoutReady } = useLaunchSplash();

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#101317' },
        }}
      />
      {phase === 'dpa' ? <DontPanicAppsSplashScreen /> : null}
      {phase === 'modewise' ? <ModeWiseLoadingScreen /> : null}
    </View>
  );
}
