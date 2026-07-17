import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrdenes } from '../../services/ordenes.service';
import type { PagedParams } from '../../types/common.types';

export function useOrdenesQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['ordenes', 'list', params],
    queryFn: () => getOrdenes(params),
    placeholderData: keepPreviousData,
  });
}
