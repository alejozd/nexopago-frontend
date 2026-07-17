// "completa" decide si el backend pasa la orden a RECIBIDA o
// PARCIALMENTE_RECIBIDA (sin tracking de cantidades, ver
// NexoPago.Services.EntradasMercancia).
export interface EntradaCreateDTO {
  ordenId: number;
  numeroEntradaHelisa: string;
  fechaEntrada: string;
  completa: boolean;
  observaciones: string | null;
}

// Fila del listado de auditoria GET /api/entradas.
export interface EntradaMercancia {
  id: number;
  numeroEntradaHelisa: string;
  fechaEntrada: string;
  numeroOrden: string;
  proveedorNombre: string;
  usuarioCreoNombre: string;
  fechaCreacion: string;
  observaciones: string | null;
}

export interface EntradasResumen {
  total: number;
  ultimoMes: number;
  ordenesAsociadas: number;
}
