import { Image, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { getMovie } from '@/api/movies';
import { useWatchlist, useWatchlistActions } from '@/hooks/use-watchlist';
import { Button, ErrorMessage, Loading, Screen, ui } from '@/components/ui';
export default function MovieScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = z.coerce.number().int().positive().safeParse(params.id);
  const query = useQuery({
    queryKey: ['movie', params.id],
    queryFn: ({ signal }) => getMovie(id.success ? id.data : 0, signal),
    enabled: id.success,
  });
  const watchlist = useWatchlist();
  const { add } = useWatchlistActions();
  const movie = query.data;
  const exists = watchlist.data?.some((entry) => entry.tmdbId === movie?.id);
  return (
    <Screen>
      {!id.success ? (
        <Text style={ui.error}>Ugyldig film-ID.</Text>
      ) : query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorMessage error={query.error} retry={() => void query.refetch()} />
      ) : (
        movie && (
          <View style={{ gap: 16 }}>
            {movie.poster_path && (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }}
                accessibilityLabel={`Filmplakat for ${movie.title}`}
                style={{
                  width: '100%',
                  maxWidth: 280,
                  aspectRatio: 2 / 3,
                  borderRadius: 12,
                  alignSelf: 'center',
                }}
              />
            )}
            <Text style={ui.title}>{movie.title}</Text>
            <Text style={ui.muted}>
              {movie.release_date.slice(0, 4) || 'År ukjent'} · TMDB:{' '}
              {movie.vote_average.toFixed(1)} / 10
            </Text>
            <Text style={ui.heading}>Om filmen</Text>
            <Text style={ui.text}>
              {movie.overview || 'Ingen beskrivelse tilgjengelig.'}
            </Text>
            {add.isError && (
              <ErrorMessage error={add.error} retry={() => add.reset()} />
            )}
            <Button
              title={
                exists || add.isSuccess
                  ? 'Lagt til i filmlisten'
                  : add.isPending
                    ? 'Legger til …'
                    : 'Legg til i filmlisten'
              }
              disabled={exists || add.isPending || add.isSuccess}
              onPress={() => add.mutate(movie)}
            />
            <Button
              title="Se min filmliste"
              onPress={() => router.navigate('/(app)/(tabs)/watchlist')}
              secondary
            />
          </View>
        )
      )}
    </Screen>
  );
}
