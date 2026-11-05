import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api/client';

export const palette = {
  page: '#0b0c14',
  panel: '#141622',
  line: '#2b2d40',
  primary: '#8056f4',
  text: '#f3f2fa',
  muted: '#aaa8bf',
  danger: '#ffd8e4',
};
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.page },
  content: {
    padding: 20,
    gap: 16,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    flexGrow: 1,
  },
  title: { color: palette.text, fontSize: 30, fontWeight: '700' },
  heading: { color: palette.text, fontSize: 20, fontWeight: '600' },
  text: { color: palette.text, fontSize: 16, lineHeight: 24 },
  muted: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  panel: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    color: palette.text,
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
    padding: 12,
    fontSize: 16,
  },
  error: { color: palette.danger, fontSize: 14, lineHeight: 22 },
});
export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={ui.page}>
      <KeyboardAvoidingView
        style={ui.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={ui.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[ui.content, { flex: 1 }]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  title,
  onPress,
  disabled,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: secondary ? palette.panel : palette.primary,
        opacity: disabled || pressed ? 0.5 : 1,
      })}
    >
      <Text style={{ color: palette.text, fontWeight: '600', fontSize: 15 }}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={ui.text}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={palette.muted}
        style={ui.input}
        {...props}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Loading({ label = 'Laster …' }: { label?: string }) {
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <ActivityIndicator color={palette.primary} />
      <Text style={ui.muted}>{label}</Text>
    </View>
  );
}
export function ErrorMessage({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { signOut } = useAuth();
  return (
    <View style={ui.panel}>
      <Text accessibilityRole="alert" style={ui.error}>
        {error instanceof Error ? error.message : String(error)}
      </Text>
      {error instanceof ApiError && error.status === 401 ? (
        <Button title="Logg inn på nytt" onPress={() => void signOut()} />
      ) : (
        retry && <Button title="Prøv igjen" onPress={retry} secondary />
      )}
    </View>
  );
}
