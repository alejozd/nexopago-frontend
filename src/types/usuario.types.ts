export interface UsuarioListItem {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  roles: string;
  activo: boolean;
  fechaUltimoAcceso: string | null;
}

export interface UsuariosResumen {
  total: number;
  activos: number;
  totalRoles: number;
}
