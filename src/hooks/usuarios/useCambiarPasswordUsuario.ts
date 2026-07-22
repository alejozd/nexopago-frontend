import { useMutation } from '@tanstack/react-query';
import { cambiarPasswordUsuario } from '../../services/usuarios.service';
import { showSuccessToast } from '../../utils/toastRef';
import type { CambiarPasswordDTO } from '../../types/usuario.types';

export function useCambiarPasswordUsuario() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CambiarPasswordDTO }) => cambiarPasswordUsuario(id, dto),
    onSuccess: () => {
      showSuccessToast('Contraseña actualizada correctamente');
    },
  });
}
