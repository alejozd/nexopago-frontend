import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProveedor } from '../../services/proveedores.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { ProveedorCreateDTO } from '../../types/proveedor.types';

export function useCreateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProveedorCreateDTO) => createProveedor(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['proveedores', 'resumen'] });
      showSuccessToast('Proveedor creado correctamente');
    },
  });
}
