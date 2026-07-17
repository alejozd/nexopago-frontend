import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecibo } from '../../services/recibos.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { ReciboCreateDTO } from '../../types/recibo.types';

export function useCreateRecibo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReciboCreateDTO) => createRecibo(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recibos'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'detalle', variables.ordenId] });
      showSuccessToast('Recibo registrado correctamente');
    },
  });
}
