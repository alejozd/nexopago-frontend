import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUsuario } from '../../services/usuarios.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { UsuarioUpdateDTO } from '../../types/usuario.types';

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UsuarioUpdateDTO }) => updateUsuario(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'list'] });
      showSuccessToast('Usuario actualizado correctamente');
    },
  });
}
