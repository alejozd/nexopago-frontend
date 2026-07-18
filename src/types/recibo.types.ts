export interface ReciboCaja {
  id: number;
  numeroRecibo: string;
  fechaRecibo: string;
  numeroOrden: string;
  proveedorNombre: string;
  monto: number;
  tipoPago: 'PARCIAL' | 'TOTAL';
  estado: 'ACTIVO' | 'ANULADO';
  observaciones: string | null;
}

// tipoPago NO se envia: el backend lo calcula comparando monto contra el
// saldo pendiente real de la orden.
export interface ReciboCreateDTO {
  ordenId: number;
  fechaRecibo: string;
  monto: number;
  observaciones: string | null;
}

export interface RecibosResumen {
  total: number;
  activos: number;
  anulados: number;
  montoTotal: number;
}
