import { useQuery } from '@tanstack/react-query';
import { getUsuariosResumen } from '../../services/usuarios.service';

export function useUsuariosResumenQuery() {
  return useQuery({
    queryKey: ['usuarios', 'resumen'],
    queryFn: getUsuariosResumen,
  });
}
