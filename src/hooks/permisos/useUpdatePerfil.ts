import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePerfil } from '../../services/permisos.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { PerfilCreateDTO } from '../../types/permiso.types';

export function useUpdatePerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: PerfilCreateDTO }) => updatePerfil(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfiles', 'list'] });
      showSuccessToast('Perfil actualizado correctamente');
    },
  });
}
