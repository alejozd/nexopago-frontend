export interface CarteraItem {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  proveedorNombre: string;
  valorTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  diasAntiguedad: number;
  rangoAntiguedad: string;
}

export interface CarteraProveedor {
  proveedorId: number;
  proveedorNombre: string;
  cantidadOrdenes: number;
  saldoPendienteTotal: number;
}
