import { useQuery } from '@tanstack/react-query';
import { getHelisaPedidoDetalle } from '../../services/helisaPedidos.service';

export function useHelisaPedidoDetalleQuery(numeroPedido: string | null, ordenId?: number) {
  return useQuery({
    // ordenId entra en la queryKey para no reusar el saldo calculado sin
    // excluir la orden en edicion al reabrir el dialogo para otra orden.
    queryKey: ['helisaPedidos', 'detalle', numeroPedido, ordenId ?? null],
    queryFn: () => getHelisaPedidoDetalle(numeroPedido!, ordenId),
    enabled: numeroPedido !== null,
  });
}
