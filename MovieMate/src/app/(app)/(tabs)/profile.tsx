import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Screen, ui } from '@/components/ui';
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setPending(true);
    try {
      await signOut();
    } catch {
      setError('Kunne ikke fjerne økten fra enheten. Prøv igjen.');
    } finally {
      setPending(false);
    }
  }
  return (
    <Screen>
      <Text style={ui.title}>Din profil</Text>
      <View style={ui.panel}>
        <Text style={ui.heading}>{user?.name}</Text>
        <Text style={ui.text}>{user?.email}</Text>
      </View>
      <Text style={ui.muted}>
        Filmlisten lagres på serveren og følger kontoen din. Du kan se den igjen
        etter omstart eller på en annen enhet som bruker samme backend.
      </Text>
      {!!error && <Text style={ui.error}>{error}</Text>}
      <Button
        title={pending ? 'Logger ut …' : 'Logg ut'}
        onPress={() => void logout()}
        disabled={pending}
      />
    </Screen>
  );
}
