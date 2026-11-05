import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { fieldErrors, loginSchema, registerSchema } from '@/utils/schemas';
import { ApiError } from '@/api/client';
import { Button, Field, Screen, ui } from './ui';

export function AuthForm({ register = false }: { register?: boolean }) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit() {
    const result = (register ? registerSchema : loginSchema).safeParse({
      name,
      email: email.trim(),
      password,
    });
    setError('');
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await signIn(
        register
          ? { name: name.trim(), email: result.data.email, password }
          : { email: result.data.email, password },
      );
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Feil e-post eller passord.'
          : err instanceof Error
            ? err.message
            : 'Kunne ikke logge inn.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <Screen>
      <View
        style={{
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          gap: 20,
          paddingTop: 24,
        }}
      >
        <Text style={ui.title}>MovieMate</Text>
        <Text style={ui.muted}>Din neste film. Din egen samling.</Text>
        <Text style={ui.heading}>
          {register ? 'Opprett konto' : 'Velkommen tilbake'}
        </Text>
        {register && (
          <Field
            label="Navn"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoComplete="name"
            editable={!pending}
          />
        )}
        <Field
          label="E-post"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!pending}
        />
        <Field
          label="Passord"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={register ? 'new-password' : 'current-password'}
          editable={!pending}
          onSubmitEditing={() => void submit()}
        />
        {!!error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
        <Button
          title={pending ? 'Venter …' : register ? 'Opprett konto' : 'Logg inn'}
          onPress={() => void submit()}
          disabled={pending}
        />
        <Link
          href={register ? '/(auth)/login' : '/(auth)/register'}
          style={ui.text}
        >
          {register ? 'Har du konto? Logg inn' : 'Ny her? Opprett konto'}
        </Link>
      </View>
    </Screen>
  );
}
