   import { render, screen } from '@testing-library/react-native';

   import { MovieCard } from '../MovieCard';

   it('viser filmtittelen', () => {
     render(<MovieCard title="Inception" rating={4.5} />);
     expect(screen.getByText('Inception')).toBeTruthy();
   });