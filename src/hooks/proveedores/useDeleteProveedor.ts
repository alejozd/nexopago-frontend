import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProveedor } from '../../services/proveedores.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useDeleteProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'list'] });
      showSuccessToast('Proveedor eliminado correctamente');
    },
  });
}
