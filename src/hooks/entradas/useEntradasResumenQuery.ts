import { useQuery } from '@tanstack/react-query';
import { getEntradasResumen } from '../../services/entradas.service';

export function useEntradasResumenQuery() {
  return useQuery({
    queryKey: ['entradas', 'resumen'],
    queryFn: getEntradasResumen,
  });
}
