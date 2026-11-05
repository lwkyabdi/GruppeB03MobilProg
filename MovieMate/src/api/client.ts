import { z } from 'zod';
import { Platform } from 'react-native';
import { getToken } from '@/utils/token-storage';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5173'
).replace(/\/$/, '');
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
const errorSchema = z.object({
  error: z.object({
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
const authErrorSchema = z.object({ message: z.string() });

export async function send(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
) {
  const token = await getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort);
  if (options.signal?.aborted) controller.abort();
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      signal: controller.signal,
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...(Platform.OS !== 'web' ? { Origin: 'moviemate://' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (!response.ok) {
      const json: unknown = await response.json().catch(() => null);
      const parsed = errorSchema.safeParse(json);
      if (parsed.success)
        throw new ApiError(
          response.status,
          parsed.data.error.message,
          parsed.data.error.fieldErrors,
        );
      const authError = authErrorSchema.safeParse(json);
      if (authError.success)
        throw new ApiError(response.status, authError.data.message);
      throw new ApiError(
        response.status,
        response.status === 401
          ? 'Økten er utløpt. Logg inn på nytt.'
          : `Forespørselen feilet (${response.status}). Prøv igjen.`,
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      'Kan ikke nå serveren. Sjekk nettverket og at backend kjører.',
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: Parameters<typeof send>[1] = {},
): Promise<T> {
  const response = await send(path, options);
  const json: unknown = await response.json().catch(() => null);
  const parsed = z
    .object({ ok: z.literal(true), data: schema })
    .safeParse(json);
  if (!parsed.success)
    throw new ApiError(
      502,
      'Uventet svar fra serveren. Kontroller backend-versjonen.',
    );
  return parsed.data.data;
}
