import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useWatchlist, useWatchlistActions } from '@/hooks/use-watchlist';
import { statusLabels, statuses, type Entry } from '@/utils/schemas';
import { Button, ErrorMessage, Loading, Screen, ui } from '@/components/ui';

export default function WatchlistScreen() {
  const query = useWatchlist();
  const { update } = useWatchlistActions();
  const [favorites, setFavorites] = useState(false);
  const [status, setStatus] = useState<Entry['status'] | null>(null);
  const entries =
    query.data?.filter(
      (entry) =>
        (!favorites || entry.favorite) && (!status || entry.status === status),
    ) ?? [];
  return (
    <Screen scroll={false}>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <Text style={ui.title}>Min filmliste</Text>
            <Text style={ui.muted}>Filmene du vil se, ser nå og har sett.</Text>
            <Button
              title={favorites ? 'Vis alle filmer' : 'Vis bare favoritter'}
              onPress={() => setFavorites(!favorites)}
              secondary
            />
            <View style={ui.row}>
              <Button
                title="Alle statuser"
                onPress={() => setStatus(null)}
                secondary={status !== null}
              />
              {statuses.map((value) => (
                <Button
                  key={value}
                  title={statusLabels[value]}
                  onPress={() => setStatus(value)}
                  secondary={status !== value}
                />
              ))}
            </View>
            {query.isPending && <Loading />}
            {query.isError && (
              <ErrorMessage
                error={query.error}
                retry={() => void query.refetch()}
              />
            )}
            {update.isError && (
              <ErrorMessage error={update.error} retry={() => update.reset()} />
            )}
          </View>
        }
        ListEmptyComponent={
          !query.isPending && !query.isError ? (
            <Text style={ui.muted}>
              {favorites || status
                ? 'Ingen filmer passer til filteret.'
                : 'Listen er tom. Finn en film under Oppdag og legg den til.'}
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={ui.panel}>
            <Text style={ui.heading}>{item.title}</Text>
            <Text style={ui.muted}>
              {statusLabels[item.status]} · Din vurdering: {item.rating ?? '–'}{' '}
              / 10
            </Text>
            {!!item.comment && <Text style={ui.text}>{item.comment}</Text>}
            <View style={ui.row}>
              <Button
                title={`${item.favorite ? '★ Fjern favoritt' : '☆ Favoritt'}: ${item.title}`}
                disabled={update.isPending}
                onPress={() =>
                  update.mutate({
                    id: item.id,
                    changes: { favorite: !item.favorite },
                  })
                }
                secondary
              />
              <Button
                title={`Rediger ${item.title}`}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/entry/[id]',
                    params: { id: item.id },
                  })
                }
                secondary
              />
              <Button
                title="Om filmen"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/movie/[id]',
                    params: { id: item.tmdbId },
                  })
                }
                secondary
              />
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
