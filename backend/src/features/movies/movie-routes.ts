import { env } from 'cloudflare:workers';
import { route } from 'rwsdk/router';
import { requireUser } from '@/features/auth/middleware';
import { jsonResult } from '@/lib/http';
import { Errors, ResultHandler } from '@/lib/result';
import {
  movieDetailsController,
  popularMoviesController,
  searchMoviesController,
} from './movie-controller';

const missingToken = () =>
  jsonResult(
    ResultHandler.failure(
      'Filmvisningen er ikke konfigurert på serveren.',
      Errors.INTERNAL_SERVER_ERROR,
    ),
  );
export const movieRoutes = [
  route('/api/v1/movies', {
    get: [
      requireUser,
      ({ request }) =>
        env.TMDB_READ_ACCESS_TOKEN
          ? searchMoviesController(request, env.TMDB_READ_ACCESS_TOKEN)
          : missingToken(),
    ],
  }),
  route('/api/v1/movies/popular', {
    get: [
      requireUser,
      () =>
        env.TMDB_READ_ACCESS_TOKEN
          ? popularMoviesController(env.TMDB_READ_ACCESS_TOKEN)
          : missingToken(),
    ],
  }),
  route('/api/v1/movies/:id', {
    get: [
      requireUser,
      ({ params }) =>
        env.TMDB_READ_ACCESS_TOKEN
          ? movieDetailsController(params.id, env.TMDB_READ_ACCESS_TOKEN)
          : missingToken(),
    ],
  }),
];
