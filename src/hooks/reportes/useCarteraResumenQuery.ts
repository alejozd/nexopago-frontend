import { useQuery } from '@tanstack/react-query';
import { getCarteraResumen } from '../../services/reportes.service';

export function useCarteraResumenQuery() {
  return useQuery({
    queryKey: ['reportes', 'cartera', 'resumen'],
    queryFn: getCarteraResumen,
  });
}
