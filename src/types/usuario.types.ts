export interface UsuarioListItem {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  roles: string;
  perfilIds: number[];
  activo: boolean;
  fechaUltimoAcceso: string | null;
}

export interface UsuariosResumen {
  total: number;
  activos: number;
  totalRoles: number;
}

export interface UsuarioCreateDTO {
  nombreUsuario: string;
  password: string;
  nombre: string;
  apellido: string | null;
  correoElectronico: string | null;
  perfilIds: number[];
}

export interface UsuarioUpdateDTO {
  nombre: string;
  apellido: string | null;
  correoElectronico: string | null;
  perfilIds: number[];
}
