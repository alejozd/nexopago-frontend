import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getEntradas } from '../../services/entradas.service';
import type { PagedParams } from '../../types/common.types';

export function useEntradasQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['entradas', 'list', params],
    queryFn: () => getEntradas(params),
    placeholderData: keepPreviousData,
  });
}
