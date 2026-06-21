import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f1115' },
          headerTintColor: '#f5f5f5',
          contentStyle: { backgroundColor: '#0f1115' },
        }}
      />
    </>
  );
}
