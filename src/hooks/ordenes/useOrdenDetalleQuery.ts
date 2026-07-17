import { useQuery } from '@tanstack/react-query';
import { getOrdenById } from '../../services/ordenes.service';

export function useOrdenDetalleQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['ordenes', 'detalle', id],
    queryFn: () => getOrdenById(id as number),
    enabled: id !== undefined,
  });
}
