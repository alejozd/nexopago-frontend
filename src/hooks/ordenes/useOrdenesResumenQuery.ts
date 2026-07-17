import { useQuery } from '@tanstack/react-query';
import { getOrdenesResumen } from '../../services/ordenes.service';

export function useOrdenesResumenQuery() {
  return useQuery({
    queryKey: ['ordenes', 'resumen'],
    queryFn: getOrdenesResumen,
  });
}
