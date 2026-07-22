import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProveedores } from '../../services/proveedores.service';
import type { PagedParams } from '../../types/common.types';

export function useProveedoresQuery(params: PagedParams, habilitado = true) {
  return useQuery({
    queryKey: ['proveedores', 'list', params],
    queryFn: () => getProveedores(params),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}
