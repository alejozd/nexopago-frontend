import { useQuery } from '@tanstack/react-query';
import { getPerfiles } from '../../services/permisos.service';

export function usePerfilesQuery() {
  return useQuery({
    queryKey: ['perfiles', 'list'],
    queryFn: () => getPerfiles({ page: 1, rows: 100 }),
  });
}
