import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asignarPermisos } from '../../services/permisos.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useAsignarPermisos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ perfilId, permisoIds }: { perfilId: number; permisoIds: number[] }) =>
      asignarPermisos(perfilId, permisoIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permisos', 'matriz', variables.perfilId] });
      showSuccessToast('Permisos actualizados correctamente');
    },
  });
}
