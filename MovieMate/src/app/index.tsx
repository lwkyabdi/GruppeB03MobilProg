import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

// The QR code opens /. Keep this route available before and after login.
export default function StartScreen() {
  const { user } = useAuth();
  return (
    <Redirect href={user ? '/(app)/(tabs)/discover' : '/(auth)/login'} />
  );
}
