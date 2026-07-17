import { axiosClient } from '../api/axiosClient';
import type { LoginCredentials, LoginResult, UsuarioMe } from '../types/auth.types';

// El backend (TMVCJWTAuthenticationMiddleware) espera las credenciales como
// headers jwtusername/jwtpassword, no como body JSON.
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await axiosClient.post<LoginResult>(
    '/auth/login',
    {},
    {
      headers: {
        jwtusername: credentials.username,
        jwtpassword: credentials.password,
      },
    },
  );
  return response.data;
}

export async function getMe(): Promise<UsuarioMe> {
  const response = await axiosClient.get<UsuarioMe>('/auth/me');
  return response.data;
}
