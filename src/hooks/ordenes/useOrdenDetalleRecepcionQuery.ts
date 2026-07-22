import { useQuery } from '@tanstack/react-query';
import { getOrdenDetalleRecepcion } from '../../services/ordenes.service';

export function useOrdenDetalleRecepcionQuery(ordenId: number | undefined) {
  return useQuery({
    queryKey: ['ordenes', 'detalle-recepcion', ordenId],
    queryFn: () => getOrdenDetalleRecepcion(ordenId as number),
    enabled: ordenId !== undefined,
  });
}
