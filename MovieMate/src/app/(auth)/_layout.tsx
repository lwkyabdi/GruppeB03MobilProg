import { Stack } from 'expo-router';
import { palette } from '@/components/ui';
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.page },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.page },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'MovieMate' }} />
      <Stack.Screen name="register" options={{ title: 'Opprett konto' }} />
    </Stack>
  );
}
