import type { CarteraProveedor } from './reporte.types';

export interface PagoMensual {
  periodo: string;
  total: number;
}

export interface OrdenEstadoCount {
  estado: string;
  cantidad: number;
}

export interface EntradaPorSemana {
  semanaInicio: string;
  cantidad: number;
}

export interface Dashboard {
  ordenesPendientes: number;
  recibosCreados: number;
  pagosPendientes: number;
  valorTotalCartera: number;
  pagosMensuales: PagoMensual[];
  ordenesPorEstado: OrdenEstadoCount[];
  topProveedoresCartera: CarteraProveedor[];
  entradasRecientes: EntradaPorSemana[];
}
