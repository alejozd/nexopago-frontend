import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrden } from '../../services/ordenes.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { OrdenCreateDTO } from '../../types/orden.types';

export function useUpdateOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: OrdenCreateDTO }) => updateOrden(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'detalle', variables.id] });
      showSuccessToast('Orden actualizada correctamente');
    },
  });
}
