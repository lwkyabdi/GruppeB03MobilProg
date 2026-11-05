import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/auth';
import { ApiError } from '@/api/client';
import { clearToken, getToken, saveToken } from '@/utils/token-storage';
import type { User } from '@/utils/schemas';

type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  restore: () => Promise<void>;
  signIn: (input: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const client = useQueryClient();
  async function restore() {
    setLoading(true);
    setError('');
    try {
      if (await getToken()) setUser(await api.getMe());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) await clearToken();
      else
        setError(
          err instanceof Error ? err.message : 'Kunne ikke gjenopprette økten.',
        );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void restore();
  }, []); // Restore once; retry is explicit.
  async function signIn(input: {
    email: string;
    password: string;
    name?: string;
  }) {
    const token = await api.authenticate(input);
    await saveToken(token);
    try {
      const nextUser = await api.getMe();
      client.clear();
      setUser(nextUser);
      setError('');
    } catch (err) {
      await clearToken();
      throw err;
    }
  }
  async function signOut() {
    // Server revocation is attempted; local logout also works without network.
    try {
      await api.signOut();
    } catch {
      /* Local token is still removed. */
    }
    await clearToken();
    await client.cancelQueries();
    client.clear();
    setUser(null);
    setError('');
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, error, restore, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth må brukes inni AuthProvider');
  return auth;
}
