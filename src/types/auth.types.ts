export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface UsuarioMe {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  roles: string[];
  permisos: string[];
}
