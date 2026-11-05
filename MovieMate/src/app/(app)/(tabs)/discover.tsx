import { useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/movies';
import { MovieCard } from '@/components/movie/MovieCard';
import {
  Button,
  ErrorMessage,
  Field,
  Loading,
  Screen,
  ui,
} from '@/components/ui';

export default function DiscoverScreen() {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : width >= 360 ? 2 : 1;
  const query = useQuery({
    queryKey: ['movies', search],
    queryFn: ({ signal }) =>
      search ? api.searchMovies(search, signal) : api.popularMovies(signal),
  });
  function submit() {
    const next = input.trim();
    if (next === search) void query.refetch();
    else setSearch(next);
  }
  return (
    <Screen scroll={false}>
      <FlatList
        key={columns}
        numColumns={columns}
        data={query.data ?? []}
        keyExtractor={(movie) => String(movie.id)}
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        keyboardShouldPersistTaps="handled"
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 4 }}>
            <Text style={ui.title}>Finn din neste film</Text>
            <Text style={ui.muted}>Oppdag filmer og samle dem du vil se.</Text>
            <Field
              label="Søk etter film"
              placeholder="For eksempel Interstellar"
              value={input}
              onChangeText={setInput}
              returnKeyType="search"
              onSubmitEditing={submit}
              maxLength={200}
            />
            <Button title="Søk" onPress={submit} />
            {!!search && (
              <Button
                title="Vis populære filmer"
                onPress={() => {
                  setInput('');
                  setSearch('');
                }}
                secondary
              />
            )}
            <Text style={ui.heading}>
              {search ? `Resultater for «${search}»` : 'Populære filmer'}
            </Text>
            {query.isPending && <Loading />}
            {query.isError && (
              <ErrorMessage
                error={query.error}
                retry={() => void query.refetch()}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          !query.isPending && !query.isError ? (
            <Text style={ui.muted}>
              Ingen filmer funnet. Prøv et annet søk.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 / columns }}>
            <MovieCard
              movie={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/movie/[id]',
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        ListFooterComponent={
          <Text style={ui.muted}>
            Filmdata og plakater fra TMDB. MovieMate er ikke godkjent eller
            sertifisert av TMDB.
          </Text>
        }
      />
    </Screen>
  );
}
