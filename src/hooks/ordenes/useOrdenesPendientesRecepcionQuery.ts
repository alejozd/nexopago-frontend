import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrdenesPendientesRecepcion } from '../../services/ordenes.service';
import type { PagedParams } from '../../types/common.types';

export function useOrdenesPendientesRecepcionQuery(params: PagedParams, habilitado = true) {
  return useQuery({
    queryKey: ['ordenes', 'pendientes-recepcion', params],
    queryFn: () => getOrdenesPendientesRecepcion(params),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}
