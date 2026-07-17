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
}

export interface HelisaPedidoDetalle {
  numeroPedido: string;
  lineas: HelisaPedidoDetalleLinea[];
}
