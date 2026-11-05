import { fireEvent, render, screen } from '@testing-library/react-native';
import { MovieCard } from '@/components/movie/MovieCard';

test('viser film uten plakat og åpner den ved trykk', async () => {
  const onPress = jest.fn();
  await render(
    <MovieCard
      movie={{
        id: 603,
        title: 'The Matrix',
        overview: '',
        poster_path: null,
        release_date: '1999-03-31',
        vote_average: 8.2,
      }}
      onPress={onPress}
    />,
  );
  expect(screen.getByText('The Matrix')).toBeTruthy();
  expect(screen.getByText('1999')).toBeTruthy();
  expect(screen.getByText('Ingen plakat')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Vis The Matrix' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
