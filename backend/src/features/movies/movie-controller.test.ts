import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  movieDetailsController,
  popularMoviesController,
  searchMoviesController,
} from './movie-controller';
import * as service from './movie-service';

vi.mock('./movie-service');
const movie = {
  id: 603,
  title: 'The Matrix',
  overview: '',
  poster_path: null,
  release_date: '1999-03-31',
  vote_average: 8.2,
};
beforeEach(() => vi.resetAllMocks());
describe('mobilens filmkontrakt', () => {
  it('returnerer samme konvolutt som watchlist', async () => {
    vi.mocked(service.searchMovieResults).mockResolvedValue([movie]);
    const response = await searchMoviesController(
      new Request('https://example.com/api/v1/movies?query=Matrix'),
      'token',
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: [movie] });
  });
  it('avviser tomt søk uten TMDB-kall', async () => {
    const response = await searchMoviesController(
      new Request('https://example.com/api/v1/movies?query=%20'),
      'token',
    );
    expect(response.status).toBe(400);
    expect(service.searchMovieResults).not.toHaveBeenCalled();
  });
  it('returnerer populære filmer', async () => {
    vi.mocked(service.getPopularMovies).mockResolvedValue([movie]);
    expect(await (await popularMoviesController('token')).json()).toEqual({
      ok: true,
      data: [movie],
    });
  });
  it('validerer ID og håndterer manglende film', async () => {
    expect((await movieDetailsController('abc', 'token')).status).toBe(400);
    expect(service.getMovieDetails).not.toHaveBeenCalled();
    vi.mocked(service.getMovieDetails).mockResolvedValue(null);
    expect((await movieDetailsController('603', 'token')).status).toBe(404);
  });
  it('oversetter feil fra ekstern kilde til 502', async () => {
    vi.mocked(service.getPopularMovies).mockRejectedValue(new Error('offline'));
    const response = await popularMoviesController('token');
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: { code: 'BAD_GATEWAY' },
    });
  });
});
