import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarEstadoUsuario } from '../../services/usuarios.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => cambiarEstadoUsuario(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'resumen'] });
      showSuccessToast('Estado del usuario actualizado');
    },
  });
}
