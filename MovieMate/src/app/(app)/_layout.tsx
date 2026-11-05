import { Stack } from 'expo-router';
import { palette } from '@/components/ui';
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.page },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.page },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movie/[id]" options={{ title: 'Filmdetaljer' }} />
      <Stack.Screen name="entry/[id]" options={{ title: 'Rediger film' }} />
    </Stack>
  );
}
