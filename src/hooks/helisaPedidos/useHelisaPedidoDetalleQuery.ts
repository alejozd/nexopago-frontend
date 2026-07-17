import { useQuery } from '@tanstack/react-query';
import { getHelisaPedidoDetalle } from '../../services/helisaPedidos.service';

export function useHelisaPedidoDetalleQuery(numeroPedido: string | null) {
  return useQuery({
    queryKey: ['helisaPedidos', 'detalle', numeroPedido],
    queryFn: () => getHelisaPedidoDetalle(numeroPedido!),
    enabled: numeroPedido !== null,
  });
}
