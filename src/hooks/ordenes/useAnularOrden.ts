import { useMutation, useQueryClient } from '@tanstack/react-query';
import { anularOrden } from '../../services/ordenes.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useAnularOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => anularOrden(id, motivo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'detalle', variables.id] });
      showSuccessToast('Orden anulada correctamente');
    },
  });
}
