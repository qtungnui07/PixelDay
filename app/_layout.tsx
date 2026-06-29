import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { PixelThemeProvider, usePixelTheme } from '@/components/PixelTheme';
import { AuthProvider } from '@/lib/auth';
import { PixelClerkProvider } from '@/lib/clerk';

function RootStack() {
  const { theme: activeTheme, themeName } = usePixelTheme();

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.colors.background }}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: activeTheme.colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PixelClerkProvider>
        <PixelThemeProvider>
          <RootStack />
        </PixelThemeProvider>
      </PixelClerkProvider>
    </AuthProvider>
  );
}
