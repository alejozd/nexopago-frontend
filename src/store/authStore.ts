import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioMe } from '../types/auth.types';

interface AuthState {
  token: string | null;
  usuario: UsuarioMe | null;
  isAuthenticated: boolean;
  setSession: (token: string) => void;
  setUsuario: (usuario: UsuarioMe) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      setSession: (token) => set({ token, isAuthenticated: true }),
      setUsuario: (usuario) => set({ usuario }),
      clearSession: () => set({ token: null, usuario: null, isAuthenticated: false }),
    }),
    {
      name: 'nexopago-auth',
      partialize: (state) => ({ token: state.token, usuario: state.usuario, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
