import { useQuery } from '@tanstack/react-query';
import { getConfiguracionEmpresa } from '../../services/empresaActiva.service';

export function useConfiguracionEmpresaQuery() {
  return useQuery({
    queryKey: ['empresaActiva', 'configuracion'],
    queryFn: getConfiguracionEmpresa,
  });
}
