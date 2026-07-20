import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sincronizarProductos } from '../../services/productos.service';
import { showSuccessToast } from '../../utils/toastRef';

export function useSincronizarProductos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sincronizarProductos,
    onSuccess: (resumen) => {
      queryClient.invalidateQueries({ queryKey: ['productos', 'list'] });
      showSuccessToast(
        `Sincronización completa: ${resumen.nuevos} nuevos, ${resumen.actualizados} actualizados de ${resumen.totalLeidos} productos leídos del ERP.`,
      );
    },
  });
}
