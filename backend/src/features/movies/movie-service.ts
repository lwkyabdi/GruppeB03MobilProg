import { searchMovies, fetchPopularMovies, fetchMovieDetails } from "./tmdb-client";
import { tmdbSearchSchema, tmdbMovieSchema, type Movie } from "./tmdb-schema";

export async function searchMovieResults(
  query: string,
  token: string,
): Promise<Movie[]> {
  const response = await searchMovies(query, token);
  const result = tmdbSearchSchema.safeParse(response);

  if (!result.success) {
    throw new Error("TMDB returnerte ugyldige filmdata");
  }

  return result.data.results;
}
export async function getPopularMovies(token: string): Promise<Movie[]> {
  const response = await fetchPopularMovies(token);
  const result = tmdbSearchSchema.safeParse(response);

  if (!result.success) {
    throw new Error("TMDB returnerte ugyldige filmdata");
  }

  return result.data.results;
}

export async function getMovieDetails(id: number, token: string): Promise<Movie | null> {
  const response = await fetchMovieDetails(id, token);
  if (response === null) return null;

  const result = tmdbMovieSchema.safeParse(response);
  if (!result.success) {
    throw new Error("TMDB returnerte ugyldige filmdata");
  }

  return result.data;
}
