import { useQuery } from '@tanstack/react-query';
import { getOrdenSaldo } from '../../services/ordenes.service';

export function useOrdenSaldoQuery(ordenId: number | undefined) {
  return useQuery({
    queryKey: ['ordenes', 'detalle-saldo', ordenId],
    queryFn: () => getOrdenSaldo(ordenId as number),
    enabled: ordenId !== undefined,
  });
}
