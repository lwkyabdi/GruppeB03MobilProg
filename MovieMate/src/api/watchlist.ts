import { z } from 'zod';
import { request, send } from './client';
import { entrySchema, type EntryChanges, type Movie } from '@/utils/schemas';

export const list = () => request('/api/v1/watchlist', z.array(entrySchema));
export const add = (movie: Movie) =>
  request('/api/v1/watchlist', entrySchema, {
    method: 'POST',
    body: {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
    },
  });
export const update = ({
  id,
  changes,
}: {
  id: string;
  changes: Partial<EntryChanges>;
}) =>
  request(`/api/v1/watchlist/${encodeURIComponent(id)}`, entrySchema, {
    method: 'PATCH',
    body: changes,
  });
export const remove = async (id: string) => {
  await send(`/api/v1/watchlist/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};
