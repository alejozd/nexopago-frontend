import { useQuery } from '@tanstack/react-query';
import { getEmpresasHelisaDisponibles } from '../../services/empresaActiva.service';

export function useEmpresasHelisaDisponiblesQuery() {
  return useQuery({
    queryKey: ['empresaActiva', 'helisaDisponibles'],
    queryFn: getEmpresasHelisaDisponibles,
    staleTime: 5 * 60 * 1000,
  });
}
