import { z } from 'zod';
import {
  getMovieDetails,
  getPopularMovies,
  searchMovieResults,
} from './movie-service';
import { jsonResult } from '@/lib/http';
import { Errors, ResultHandler } from '@/lib/result';

const querySchema = z.string().trim().min(1).max(200);
const idSchema = z.coerce.number().int().positive();
const upstreamError = () =>
  jsonResult(
    ResultHandler.failure(
      'Kunne ikke hente filmer fra TMDB. Prøv igjen.',
      Errors.BAD_GATEWAY,
    ),
  );

export async function searchMoviesController(
  request: Request,
  token: string,
): Promise<Response> {
  const query = querySchema.safeParse(
    new URL(request.url).searchParams.get('query'),
  );
  if (!query.success)
    return jsonResult(
      ResultHandler.failure(
        'Søket må ha mellom 1 og 200 tegn.',
        Errors.BAD_REQUEST,
      ),
    );
  try {
    return jsonResult(
      ResultHandler.success(await searchMovieResults(query.data, token)),
    );
  } catch {
    return upstreamError();
  }
}
export async function popularMoviesController(
  token: string,
): Promise<Response> {
  try {
    return jsonResult(ResultHandler.success(await getPopularMovies(token)));
  } catch {
    return upstreamError();
  }
}
export async function movieDetailsController(
  rawId: string,
  token: string,
): Promise<Response> {
  const id = idSchema.safeParse(rawId);
  if (!id.success)
    return jsonResult(
      ResultHandler.failure('Ugyldig film-ID.', Errors.BAD_REQUEST),
    );
  try {
    const movie = await getMovieDetails(id.data, token);
    return movie
      ? jsonResult(ResultHandler.success(movie))
      : jsonResult(
          ResultHandler.failure('Filmen finnes ikke.', Errors.NOT_FOUND),
        );
  } catch {
    return upstreamError();
  }
}
