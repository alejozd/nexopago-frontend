import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUsuario } from '../../services/usuarios.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { UsuarioCreateDTO } from '../../types/usuario.types';

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UsuarioCreateDTO) => createUsuario(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'resumen'] });
      showSuccessToast('Usuario creado correctamente');
    },
  });
}
