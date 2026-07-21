export interface Producto {
  id: number;
  codigoHelisa: string;
  subCodigoHelisa: string;
  codigoInterno: string | null;
  descripcion: string;
  unidadMedida: string | null;
  precioReferencia: number | null;
  activo: boolean;
}

export interface SincronizacionResumen {
  totalLeidos: number;
  nuevos: number;
  actualizados: number;
  fechaHoraSinc: string;
}

export interface ProductosResumen {
  total: number;
  ultimaSincronizacion: string | null;
}
