import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getMe } from '../../services/auth.service';

// Al montar la app, si hay token persistido pero aun no se cargo el usuario
// (p.ej. primera carga tras un login previo), rehidrata con GET /auth/me.
export function useSessionBootstrap() {
  const token = useAuthStore((state) => state.token);
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (token && !usuario) {
      getMe()
        .then(setUsuario)
        .catch(() => clearSession());
    }
  }, [token, usuario, setUsuario, clearSession]);
}
