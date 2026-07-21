export interface EntradaLineaCreateDTO {
  ordenDetalleId: number;
  cantidadRecibida: number;
}

// "completa" ya no existe: el backend calcula RECIBIDA/PARCIALMENTE_RECIBIDA
// comparando el total pedido contra el total real recibido (detalles),
// ver NexoPago.Services.EntradasMercancia.
export interface EntradaCreateDTO {
  ordenId: number;
  numeroEntradaHelisa: string;
  fechaEntrada: string;
  observaciones: string | null;
  detalles: EntradaLineaCreateDTO[];
}

// Fila del listado de auditoria GET /api/entradas.
export interface EntradaMercancia {
  id: number;
  numeroEntradaHelisa: string;
  fechaEntrada: string;
  ordenId: number;
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
