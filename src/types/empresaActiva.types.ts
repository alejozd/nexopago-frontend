export interface EmpresaActivaInfo {
  codigo: number;
  nombre: string;
  fechaActivacion: string;
}

export interface EmpresaActivaHistorialItem {
  usuarioNombre: string;
  fechaCambio: string;
  codigoAnterior: number | null;
  nombreAnterior: string | null;
  codigoNuevo: number;
  nombreNuevo: string;
}

export interface EmpresaActivaConfig {
  tieneConfiguracion: boolean;
  empresaActiva: EmpresaActivaInfo | null;
  historial: EmpresaActivaHistorialItem[];
}

export interface EmpresaHelisaDisponible {
  codigo: number;
  nombre: string;
}

export interface CambiarEmpresaActivaPayload {
  codigoEmpresa: number;
}
