import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarEstadoProveedor } from '../../services/proveedores.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useCambiarEstadoProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => cambiarEstadoProveedor(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'resumen'] });
      showSuccessToast('Estado del proveedor actualizado');
    },
  });
}
