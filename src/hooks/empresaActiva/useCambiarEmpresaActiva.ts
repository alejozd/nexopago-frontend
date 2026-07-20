import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarEmpresaActiva } from '../../services/empresaActiva.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { ApiError } from '../../types/common.types';
import type { CambiarEmpresaActivaPayload, EmpresaActivaInfo } from '../../types/empresaActiva.types';

export function useCambiarEmpresaActiva() {
  const queryClient = useQueryClient();
  return useMutation<EmpresaActivaInfo, ApiError, CambiarEmpresaActivaPayload>({
    mutationFn: (payload: CambiarEmpresaActivaPayload) => cambiarEmpresaActiva(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresaActiva', 'configuracion'] });
      queryClient.invalidateQueries({ queryKey: ['empresa', 'actual'] });
      showSuccessToast('Empresa activa actualizada correctamente');
    },
  });
}
