import { Stack, DarkTheme, ThemeProvider } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import {
  Button,
  ErrorMessage,
  Loading,
  palette,
  Screen,
} from '@/components/ui';
import { ApiError } from '@/api/client';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, error) =>
        !(error instanceof ApiError && error.status < 500) && count < 1,
    },
  },
});
function Navigator() {
  const { user, loading, error, restore, signOut } = useAuth();
  if (loading)
    return (
      <Screen>
        <Loading label="Starter MovieMate …" />
      </Screen>
    );
  if (error)
    return (
      <Screen>
        <ErrorMessage error={error} retry={() => void restore()} />
        <Button
          title="Gå til innlogging"
          onPress={() => void signOut()}
          secondary
        />
      </Screen>
    );
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.page },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.page },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Navigator />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
