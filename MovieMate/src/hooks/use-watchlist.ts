import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/watchlist';
import { useAuth } from '@/contexts/AuthContext';

export function useWatchlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: api.list,
    enabled: !!user,
  });
}
export function useWatchlistActions() {
  const client = useQueryClient();
  const onSuccess = () => client.invalidateQueries({ queryKey: ['watchlist'] });
  const add = useMutation({ mutationFn: api.add, onSuccess });
  const update = useMutation({ mutationFn: api.update, onSuccess });
  const remove = useMutation({ mutationFn: api.remove, onSuccess });
  return { add, update, remove };
}
