export interface Modulo {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Perfil {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Permiso {
  id: number;
  moduloId: number;
  moduloNombre: string;
  accion: string;
  descripcion: string;
}

// Catalogo completo de permisos + flag por cada uno para un perfil
// especifico: listo para pintar la matriz de checkboxes.
export interface PermisoMatrizItem {
  permisoId: number;
  moduloNombre: string;
  accion: string;
  asignado: boolean;
}
