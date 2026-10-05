import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '../theme';
import { SessionProvider, useSession } from '../data/SessionContext';
import { ListsProvider } from '../data/ListsContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ListsProvider>
          <RootStack />
        </ListsProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootStack() {
  const { session, loading } = useSession();
  const { colors, scheme } = useTheme();

  // Wait for the stored session before choosing between the auth screens and the app
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: '' }} />
          <Stack.Screen name="register" options={{ title: '' }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="list/[id]" options={{ title: '' }} />
          <Stack.Screen name="list-form" options={{ presentation: 'modal', title: 'New List' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
