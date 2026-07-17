import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProductos } from '../../services/productos.service';
import type { PagedParams } from '../../types/common.types';

export function useProductosQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['productos', 'list', params],
    queryFn: () => getProductos(params),
    placeholderData: keepPreviousData,
  });
}
