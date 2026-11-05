import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Text } from 'react-native';
import { useState } from 'react';
import * as authApi from '@/api/auth';
import * as movieApi from '@/api/movies';
import * as watchlistApi from '@/api/watchlist';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui';
import DiscoverScreen from '@/app/(app)/(tabs)/discover';
import MovieScreen from '@/app/(app)/movie/[id]';
import WatchlistScreen from '@/app/(app)/(tabs)/watchlist';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import type { Entry } from '@/utils/schemas';

jest.mock('@/api/auth');
jest.mock('@/api/movies');
jest.mock('@/api/watchlist');
const movie = {
  id: 603,
  title: 'The Matrix',
  overview: 'En hacker oppdager sannheten.',
  poster_path: null,
  release_date: '1999-03-31',
  vote_average: 8.2,
};
const user = { id: 'user-1', name: 'Ada', email: 'ada@example.com' };
let saved: Entry[];
const clients: QueryClient[] = [];
afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

// Real screens, context and queries. Only API and native navigation are mocked.
function Flow() {
  const auth = useAuth();
  const [page, setPage] = useState('discover');
  jest.mocked(router.push).mockImplementation(() => setPage('movie'));
  jest.mocked(router.navigate).mockImplementation(() => setPage('watchlist'));
  if (auth.loading) return <Text>Starter</Text>;
  if (!auth.user) return <AuthForm />;
  return (
    <>
      <Button title="Avslutt økt" onPress={() => void auth.signOut()} />
      {page === 'discover' ? (
        <DiscoverScreen />
      ) : page === 'movie' ? (
        <MovieScreen />
      ) : (
        <WatchlistScreen />
      )}
    </>
  );
}
function app() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  clients.push(client);
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Flow />
      </AuthProvider>
    </QueryClientProvider>
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  saved = [];
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  jest.mocked(authApi.authenticate).mockResolvedValue('session-token');
  jest.mocked(authApi.getMe).mockResolvedValue(user);
  jest.mocked(movieApi.popularMovies).mockResolvedValue([movie]);
  jest.mocked(movieApi.searchMovies).mockResolvedValue([movie]);
  jest.mocked(movieApi.getMovie).mockResolvedValue(movie);
  jest.mocked(watchlistApi.list).mockImplementation(async () => [...saved]);
  jest.mocked(watchlistApi.add).mockImplementation(async () => {
    const entry: Entry = {
      id: 'entry-1',
      tmdbId: 603,
      title: movie.title,
      posterPath: null,
      status: 'wanted',
      rating: null,
      favorite: false,
      comment: null,
      createdAt: '2026-11-05T10:00:00.000Z',
    };
    saved.push(entry);
    return entry;
  });
  jest.mocked(watchlistApi.update).mockImplementation(async ({ changes }) => {
    saved = saved.map((entry) => ({ ...entry, ...changes }));
    return saved[0];
  });
});
test('logg inn, søk, legg til, se listen, merk favoritt og gjenopprett etter omstart', async () => {
  const view = await render(app());
  await screen.findByText('Velkommen tilbake');
  await fireEvent.changeText(
    screen.getByLabelText('E-post'),
    'ada@example.com',
  );
  await fireEvent.changeText(screen.getByLabelText('Passord'), 'passord123');
  await fireEvent.press(screen.getByRole('button', { name: 'Logg inn' }));
  await screen.findByText('Finn din neste film');
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
    'moviemate-session',
    'session-token',
  );
  await fireEvent.changeText(screen.getByLabelText('Søk etter film'), 'Matrix');
  await fireEvent.press(screen.getByRole('button', { name: 'Søk' }));
  await waitFor(() => expect(movieApi.searchMovies).toHaveBeenCalled());
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Vis The Matrix' }),
  );
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Legg til i filmlisten' }),
  );
  await screen.findByText('Lagt til i filmlisten');
  expect(watchlistApi.add).toHaveBeenCalledWith(movie, expect.anything());
  await fireEvent.press(
    screen.getByRole('button', { name: 'Se min filmliste' }),
  );
  await screen.findByText('The Matrix');
  await fireEvent.press(
    screen.getByRole('button', { name: '☆ Favoritt: The Matrix' }),
  );
  await screen.findByRole('button', { name: '★ Fjern favoritt: The Matrix' });
  await view.unmount();
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue('session-token');
  await render(app());
  await screen.findByText('Finn din neste film');
  expect(authApi.getMe).toHaveBeenCalledTimes(2);
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Vis The Matrix' }),
  );
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Se min filmliste' }),
  );
  await screen.findByRole('button', { name: '★ Fjern favoritt: The Matrix' });
  await fireEvent.press(screen.getByRole('button', { name: 'Avslutt økt' }));
  await screen.findByText('Velkommen tilbake');
  expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
});
