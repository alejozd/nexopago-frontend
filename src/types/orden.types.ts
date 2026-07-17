export type OrdenEstado = 'BORRADOR' | 'PENDIENTE' | 'PARCIALMENTE_RECIBIDA' | 'RECIBIDA' | 'ANULADA';

export interface OrdenListItem {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  proveedorNombre: string;
  estado: OrdenEstado;
  valorTotal: number;
}

export interface OrdenesResumen {
  pendientes: number;
  recibidas: number;
  anuladas: number;
}

export interface OrdenLinea {
  id: number;
  productoId: number;
  productoDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenDetalle {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  proveedorId: number;
  proveedorNombre: string;
  numeroPedidoHelisa: string | null;
  fechaPedidoHelisa: string | null;
  totalPedidoHelisa: number | null;
  observaciones: string | null;
  estado: OrdenEstado;
  valorTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  detalles: OrdenLinea[];
}

export interface OrdenLineaCreateDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenCreateDTO {
  proveedorId: number;
  fechaOrden: string;
  numeroPedidoHelisa: string | null;
  fechaPedidoHelisa: string | null;
  totalPedidoHelisa: number | null;
  observaciones: string | null;
  detalles: OrdenLineaCreateDTO[];
}
