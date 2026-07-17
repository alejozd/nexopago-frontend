import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntrada } from '../../services/entradas.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { EntradaCreateDTO } from '../../types/entrada.types';

export function useCreateEntrada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: EntradaCreateDTO) => createEntrada(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes', 'detalle', variables.ordenId] });
      showSuccessToast('Entrada de mercancía registrada correctamente');
    },
  });
}
