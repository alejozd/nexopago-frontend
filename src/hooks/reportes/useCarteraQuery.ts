import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCartera } from '../../services/reportes.service';
import type { PagedParams } from '../../types/common.types';

export function useCarteraQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['reportes', 'cartera', params],
    queryFn: () => getCartera(params),
    placeholderData: keepPreviousData,
  });
}
