import { useQuery } from '@tanstack/react-query';
import { getRecibosResumen } from '../../services/recibos.service';

export function useRecibosResumenQuery() {
  return useQuery({
    queryKey: ['recibos', 'resumen'],
    queryFn: getRecibosResumen,
  });
}
