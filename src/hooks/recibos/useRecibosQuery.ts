import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getRecibos } from '../../services/recibos.service';
import type { PagedParams } from '../../types/common.types';

export function useRecibosQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['recibos', 'list', params],
    queryFn: () => getRecibos(params),
    placeholderData: keepPreviousData,
  });
}
