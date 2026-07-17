import { useMutation, useQueryClient } from '@tanstack/react-query';
import { anularRecibo } from '../../services/recibos.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useAnularRecibo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => anularRecibo(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recibos'] });
      showSuccessToast('Recibo anulado correctamente');
    },
  });
}
