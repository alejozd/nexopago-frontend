import { useQuery } from '@tanstack/react-query';
import { getEmpresaActual } from '../../services/empresa.service';

export function useEmpresaActualQuery() {
  return useQuery({
    queryKey: ['empresa', 'actual'],
    queryFn: getEmpresaActual,
  });
}
