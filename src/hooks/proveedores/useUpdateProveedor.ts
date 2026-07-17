import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProveedor } from '../../services/proveedores.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { ProveedorCreateDTO } from '../../types/proveedor.types';

export function useUpdateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ProveedorCreateDTO }) => updateProveedor(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'list'] });
      showSuccessToast('Proveedor actualizado correctamente');
    },
  });
}
