import { useMutation } from '@tanstack/react-query';
import { login, getMe } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import type { LoginCredentials } from '../../types/auth.types';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const setUsuario = useAuthStore((state) => state.setUsuario);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { token } = await login(credentials);
      setSession(token);
      const usuario = await getMe();
      setUsuario(usuario);
      return usuario;
    },
    // El error de login se muestra inline en LoginPage, no en el toast global.
    meta: { silent: true },
  });
}
