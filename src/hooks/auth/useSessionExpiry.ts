import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { refreshToken } from '../../services/auth.service';
import { getJwtExpirationMs } from '../../utils/jwt';

const WARNING_WINDOW_MS = 2 * 60 * 1000;

export interface UseSessionExpiryResult {
  showWarning: boolean;
  secondsLeft: number;
  isRenewing: boolean;
  renewError: boolean;
  renewSession: () => void;
  endSession: () => void;
}

// Fase 2 de la feature de expiracion de sesion: solo la deteccion/renovacion,
// el modal (Fase 3) todavia no existe y consumira este mismo shape de retorno.
export function useSessionExpiry(): UseSessionExpiryResult {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [renewError, setRenewError] = useState(false);

  const warnTimeoutRef = useRef<number>();
  const logoutTimeoutRef = useRef<number>();
  const tickIntervalRef = useRef<number>();

  const endSession = useCallback(() => {
    clearSession();
    window.location.assign('/login');
  }, [clearSession]);

  const { mutate: mutateRefresh, isPending: isRenewing } = useMutation({
    mutationFn: refreshToken,
    onSuccess: ({ token: newToken }) => {
      setRenewError(false);
      // setSession cambia `token`, lo que reinicia todos los timers de abajo
      // usando el nuevo exp (no el de la sesion que acaba de expirar).
      setSession(newToken);
    },
    onError: () => {
      setRenewError(true);
    },
    // El fallo de renovacion se refleja en renewError para el futuro dialogo,
    // no en el toast global.
    meta: { silent: true },
  });

  const renewSession = useCallback(() => {
    mutateRefresh();
  }, [mutateRefresh]);

  useEffect(() => {
    const clearAllTimers = () => {
      window.clearTimeout(warnTimeoutRef.current);
      window.clearTimeout(logoutTimeoutRef.current);
      window.clearInterval(tickIntervalRef.current);
    };

    if (!isAuthenticated || !token) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    const expirationMs = getJwtExpirationMs(token);
    if (expirationMs === null) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    setShowWarning(false);
    setRenewError(false);

    const msUntilWarning = Math.max(0, expirationMs - WARNING_WINDOW_MS - Date.now());
    const msUntilExpiration = Math.max(0, expirationMs - Date.now());

    warnTimeoutRef.current = window.setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(Math.max(0, Math.round((expirationMs - Date.now()) / 1000)));

      // El tick de 1s solo corre mientras el warning esta activo.
      tickIntervalRef.current = window.setInterval(() => {
        setSecondsLeft(Math.max(0, Math.round((expirationMs - Date.now()) / 1000)));
      }, 1000);
    }, msUntilWarning);

    logoutTimeoutRef.current = window.setTimeout(() => {
      endSession();
    }, msUntilExpiration);

    return clearAllTimers;
  }, [token, isAuthenticated, endSession]);

  return {
    showWarning,
    secondsLeft,
    isRenewing,
    renewError,
    renewSession,
    endSession,
  };
}
