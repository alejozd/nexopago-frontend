import { useQuery } from '@tanstack/react-query';
import { getHelisaPedidosRecientes } from '../../services/helisaPedidos.service';

export function useHelisaPedidosQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['helisaPedidos', 'recientes'],
    queryFn: getHelisaPedidosRecientes,
    enabled,
  });
}
