import { useQuery } from '@tanstack/react-query';
import { getHelisaPedidosRecientes } from '../../services/helisaPedidos.service';

// desde/hasta (YYYY-MM-DD): forman parte de la queryKey para que el cambio
// de fecha en el selector dispare el refetch automaticamente.
export function useHelisaPedidosQuery(enabled: boolean, desde?: string, hasta?: string) {
  return useQuery({
    queryKey: ['helisaPedidos', 'recientes', desde ?? null, hasta ?? null],
    queryFn: () => getHelisaPedidosRecientes(desde, hasta),
    enabled,
  });
}
