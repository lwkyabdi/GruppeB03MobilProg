import { ApiError, request } from '@/api/client';
import { movieSchema } from '@/utils/schemas';
import * as SecureStore from 'expo-secure-store';

afterEach(() => jest.restoreAllMocks());
test('sender native origin og bearer-token uten cookies', async () => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue('test-token');
  const movie = {
    id: 603,
    title: 'Matrix',
    overview: '',
    poster_path: null,
    release_date: '',
    vote_average: 8,
  };
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: movie }),
    } as Response);
  expect(await request('/api/v1/movies/603', movieSchema)).toEqual(movie);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/movies/603'),
    expect.objectContaining({
      credentials: 'omit',
      headers: expect.objectContaining({
        Origin: 'moviemate://',
        Authorization: 'Bearer test-token',
      }),
    }),
  );
});
test('ugyldige serversvar og nettbrudd blir forståelige API-feil', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { id: 'feil' } }),
    } as Response);
  await expect(
    request('/api/v1/movies/603', movieSchema),
  ).rejects.toMatchObject({ status: 502 });
  fetchMock.mockRejectedValue(new Error('offline'));
  await expect(
    request('/api/v1/movies/603', movieSchema),
  ).rejects.toBeInstanceOf(ApiError);
});
test('serverens feltfeil beholdes', async () => {
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        ok: false,
        error: {
          message: 'Ugyldig input',
          fieldErrors: { rating: ['Velg 1–10'] },
        },
      }),
    } as Response);
  await expect(
    request('/api/v1/watchlist/1', movieSchema),
  ).rejects.toMatchObject({
    status: 400,
    fieldErrors: { rating: ['Velg 1–10'] },
  });
});
