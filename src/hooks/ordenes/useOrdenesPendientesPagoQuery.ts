import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrdenesPendientesPago } from '../../services/ordenes.service';
import type { PagedParams } from '../../types/common.types';

export function useOrdenesPendientesPagoQuery(params: PagedParams, habilitado = true) {
  return useQuery({
    queryKey: ['ordenes', 'pendientes-pago', params],
    queryFn: () => getOrdenesPendientesPago(params),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}
