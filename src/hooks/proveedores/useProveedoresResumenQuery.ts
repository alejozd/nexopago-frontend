import { useQuery } from '@tanstack/react-query';
import { getProveedoresResumen } from '../../services/proveedores.service';

export function useProveedoresResumenQuery() {
  return useQuery({
    queryKey: ['proveedores', 'resumen'],
    queryFn: getProveedoresResumen,
  });
}
