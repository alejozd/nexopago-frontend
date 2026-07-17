import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUsuarios } from '../../services/usuarios.service';
import type { PagedParams } from '../../types/common.types';

export function useUsuariosQuery(params: PagedParams) {
  return useQuery({
    queryKey: ['usuarios', 'list', params],
    queryFn: () => getUsuarios(params),
    placeholderData: keepPreviousData,
  });
}
