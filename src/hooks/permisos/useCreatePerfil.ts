import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPerfil } from '../../services/permisos.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { PerfilCreateDTO } from '../../types/permiso.types';

export function useCreatePerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PerfilCreateDTO) => createPerfil(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfiles', 'list'] });
      showSuccessToast('Perfil creado correctamente');
    },
  });
}
