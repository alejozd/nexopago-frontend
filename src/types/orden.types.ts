export type OrdenEstado = 'BORRADOR' | 'PENDIENTE' | 'PARCIALMENTE_RECIBIDA' | 'RECIBIDA' | 'ANULADA';

export interface OrdenListItem {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  proveedorNombre: string;
  proyecto: string;
  solicitud: string;
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
  productoCodigoInterno: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  // Consecutivo de la linea del pedido Helisa de la que salio esta cantidad
  // (null si la linea se agrego manualmente, sin pasar por el buscador).
  consecutivoPedidoHelisa: number | null;
  // Suma real de entradas de mercancia ya registradas para esta linea (0 si
  // aun no se ha recibido nada). Ver ENTRADA_DETALLE.
  cantidadRecibida: number;
  // cantidad - cantidadRecibida. Tope maximo al registrar una nueva entrada.
  saldoPendiente: number;
}

export interface OrdenDetalle {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  proveedorId: number;
  proveedorNombre: string;
  numeroPedidoHelisa: string | null;
  fechaPedidoHelisa: string | null;
  observaciones: string | null;
  proyecto: string | null;
  solicitud: string | null;
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
  // Ver OrdenLinea.consecutivoPedidoHelisa: se manda para que el backend
  // pueda descontar el saldo disponible de esa linea del pedido Helisa.
  consecutivoPedidoHelisa?: number | null;
}

export interface OrdenCreateDTO {
  proveedorId: number;
  fechaOrden: string;
  numeroPedidoHelisa: string | null;
  fechaPedidoHelisa: string | null;
  observaciones: string | null;
  proyecto: string | null;
  solicitud: string | null;
  detalles: OrdenLineaCreateDTO[];
}
