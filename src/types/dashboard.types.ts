export interface PagoMensual {
  periodo: string;
  total: number;
}

export interface OrdenEstadoCount {
  estado: string;
  cantidad: number;
}

export interface Dashboard {
  ordenesPendientes: number;
  recibosCreados: number;
  pagosPendientes: number;
  valorTotalCartera: number;
  pagosMensuales: PagoMensual[];
  ordenesPorEstado: OrdenEstadoCount[];
}
