import { useQuery } from '@tanstack/react-query';
import { getProductosResumen } from '../../services/productos.service';

export function useProductosResumenQuery() {
  return useQuery({
    queryKey: ['productos', 'resumen'],
    queryFn: getProductosResumen,
  });
}
