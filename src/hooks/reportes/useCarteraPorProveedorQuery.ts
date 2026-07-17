import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCarteraPorProveedor } from '../../services/reportes.service';
import type { PagedParams } from '../../types/common.types';

export function useCarteraPorProveedorQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['reportes', 'cartera-proveedor', params],
    queryFn: () => getCarteraPorProveedor(params),
    placeholderData: keepPreviousData,
  });
}
