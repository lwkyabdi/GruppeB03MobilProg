import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { Movie } from '@/utils/schemas';
import { palette, ui } from '@/components/ui';

export function MovieCard({
  movie,
  onPress,
}: {
  movie: Movie;
  onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Vis ${movie.title}`}
      onPress={onPress}
      style={[ui.panel, { padding: 0, overflow: 'hidden', flex: 1 }]}
    >
      {movie.poster_path && !failed ? (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          accessibilityLabel={`Filmplakat for ${movie.title}`}
          style={{ width: '100%', aspectRatio: 2 / 3 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{
            aspectRatio: 2 / 3,
            backgroundColor: palette.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={ui.muted}>Ingen plakat</Text>
        </View>
      )}
      <View style={{ padding: 12, gap: 6 }}>
        <Text style={[ui.text, { fontWeight: '600' }]}>{movie.title}</Text>
        <Text style={ui.muted}>
          {movie.release_date.slice(0, 4) || 'År ukjent'}
        </Text>
        <Text style={{ color: '#c4b3ff' }}>
          ★ {movie.vote_average.toFixed(1)} / 10
        </Text>
      </View>
    </Pressable>
  );
}
