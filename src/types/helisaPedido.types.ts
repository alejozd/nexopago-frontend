export interface HelisaPedidoResumen {
  numeroPedido: string;
  fecha: string;
}

export interface HelisaPedidoDetalleLinea {
  consecutivo: number;
  codigoConcepto: string;
  subCodigo: string;
  descripcion: string;
  referencia: string;
  cantidadPedida: number;
  cantidadConsumida: number;
  // Fuente de verdad para "cuanto se puede tomar de esta linea": el backend
  // ya descuenta lo consumido por otras ordenes (y, si se manda ordenId, lo
  // que la orden en edicion ya tenia guardado contra si misma).
  saldoDisponible: number;
}

export interface HelisaPedidoDetalle {
  numeroPedido: string;
  lineas: HelisaPedidoDetalleLinea[];
}
