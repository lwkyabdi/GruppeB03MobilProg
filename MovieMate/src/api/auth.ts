import { z } from 'zod';
import { ApiError, request, send } from './client';
import { userSchema } from '@/utils/schemas';

export async function authenticate(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const response = await send(
    `/api/auth/${input.name === undefined ? 'sign-in' : 'sign-up'}/email`,
    { method: 'POST', body: input },
  );
  const token = response.headers.get('set-auth-token');
  const parsed = z.string().min(1).safeParse(token);
  if (!parsed.success)
    throw new ApiError(502, 'Serveren returnerte ikke et sesjonstoken.');
  return parsed.data;
}
export const getMe = () => request('/api/me', userSchema);
export const signOut = () =>
  send('/api/auth/sign-out', { method: 'POST', body: {} });
