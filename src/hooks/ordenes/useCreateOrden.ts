import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrden } from '../../services/ordenes.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { OrdenCreateDTO } from '../../types/orden.types';

export function useCreateOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OrdenCreateDTO) => createOrden(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'list'] });
      showSuccessToast('Orden creada correctamente');
    },
  });
}
