export interface Proveedor {
  id: number;
  nit: string;
  codigoHelisa: number | null;
  codigoInterno: string | null;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  correoElectronico: string | null;
  activo: boolean;
}

// Body de POST/PUT: sin id/activo (activo se cambia por su propio endpoint).
export interface ProveedorCreateDTO {
  nit: string;
  codigoHelisa: number | null;
  codigoInterno: string | null;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  correoElectronico: string | null;
}

export interface ProveedoresResumen {
  total: number;
  activos: number;
  inactivos: number;
}
