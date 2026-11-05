import { z } from 'zod';
import { request } from './client';
import { movieSchema } from '@/utils/schemas';

export const searchMovies = (query: string, signal?: AbortSignal) =>
  request(
    `/api/v1/movies?query=${encodeURIComponent(query)}`,
    z.array(movieSchema),
    { signal },
  );
export const popularMovies = (signal?: AbortSignal) =>
  request('/api/v1/movies/popular', z.array(movieSchema), { signal });
export const getMovie = (id: number, signal?: AbortSignal) =>
  request(`/api/v1/movies/${id}`, movieSchema, { signal });
