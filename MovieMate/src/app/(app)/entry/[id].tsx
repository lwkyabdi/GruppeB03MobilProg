import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWatchlist, useWatchlistActions } from '@/hooks/use-watchlist';
import {
  entryFormSchema,
  fieldErrors,
  statusLabels,
  statuses,
  type Entry,
} from '@/utils/schemas';
import {
  Button,
  ErrorMessage,
  Field,
  Loading,
  Screen,
  ui,
} from '@/components/ui';
function EditForm({ entry }: { entry: Entry }) {
  const { update, remove } = useWatchlistActions();
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating?.toString() ?? '');
  const [comment, setComment] = useState(entry.comment ?? '');
  const [favorite, setFavorite] = useState(entry.favorite);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = update.isPending || remove.isPending;
  function save() {
    const result = entryFormSchema.safeParse({
      status,
      rating,
      comment,
      favorite,
    });
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    update.mutate(
      {
        id: entry.id,
        changes: {
          ...result.data,
          rating: result.data.rating === '' ? null : Number(result.data.rating),
          comment: result.data.comment || null,
        },
      },
      { onSuccess: () => router.back() },
    );
  }
  function confirmRemove() {
    Alert.alert('Slett film?', `Vil du fjerne ${entry.title} fra filmlisten?`, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: () =>
          remove.mutate(entry.id, { onSuccess: () => router.back() }),
      },
    ]);
  }
  return (
    <>
      <Text style={ui.title}>{entry.title}</Text>
      <Text style={ui.text}>Status</Text>
      <View style={ui.row}>
        {statuses.map((value) => (
          <Button
            key={value}
            title={statusLabels[value]}
            secondary={status !== value}
            disabled={pending}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>
      <Field
        label="Din vurdering (1–10)"
        value={rating}
        onChangeText={setRating}
        error={errors.rating}
        keyboardType="number-pad"
        editable={!pending}
      />
      <Field
        label="Kommentar"
        value={comment}
        onChangeText={setComment}
        error={errors.comment}
        multiline
        editable={!pending}
      />
      <Button
        title={favorite ? '★ Favoritt' : '☆ Merk som favoritt'}
        onPress={() => setFavorite(!favorite)}
        secondary={!favorite}
        disabled={pending}
      />
      {(update.isError || remove.isError) && (
        <ErrorMessage error={update.error ?? remove.error} />
      )}
      <Button
        title={pending ? 'Venter …' : 'Lagre endringer'}
        onPress={save}
        disabled={pending}
      />
      <Button
        title="Slett fra filmlisten"
        onPress={confirmRemove}
        secondary
        disabled={pending}
      />
    </>
  );
}
export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useWatchlist();
  const entry = query.data?.find((value) => value.id === id);
  return (
    <Screen>
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorMessage error={query.error} retry={() => void query.refetch()} />
      ) : entry ? (
        <EditForm key={entry.id} entry={entry} />
      ) : (
        <Text style={ui.muted}>Filmen finnes ikke i listen din.</Text>
      )}
    </Screen>
  );
}
