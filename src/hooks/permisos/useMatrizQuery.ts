import { useQuery } from '@tanstack/react-query';
import { getMatriz } from '../../services/permisos.service';

export function useMatrizQuery(perfilId: number | undefined) {
  return useQuery({
    queryKey: ['permisos', 'matriz', perfilId],
    queryFn: () => getMatriz(perfilId as number),
    enabled: perfilId !== undefined,
  });
}
