import { StyleSheet, Text, View } from 'react-native';

type MovieCardProps = {
  title: string;
  rating?: number;
};

export function MovieCard({ title, rating }: MovieCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.poster}>
        <Text style={styles.posterText}>Ingen plakat</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.rating}>Rating: {rating ?? '–'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  poster: {
    height: 192,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  posterText: {
    color: '#64748b',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  rating: {
    fontSize: 14,
    color: '#64748b',
  },
});