import { useQuery } from '@tanstack/react-query';
import { getRecibos } from '../../services/recibos.service';

export function useUltimosRecibosQuery() {
  return useQuery({
    queryKey: ['recibos', 'ultimos'],
    queryFn: () => getRecibos({ page: 1, rows: 5, sortField: 'fechaRecibo', sortOrder: -1 }),
  });
}
