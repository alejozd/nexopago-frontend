import { axiosClient } from '../api/axiosClient';
import type {
  CambiarEmpresaActivaPayload,
  EmpresaActivaConfig,
  EmpresaActivaInfo,
  EmpresaHelisaDisponible,
} from '../types/empresaActiva.types';

export async function getConfiguracionEmpresa(): Promise<EmpresaActivaConfig> {
  const response = await axiosClient.get<EmpresaActivaConfig>('/empresa/configuracion');
  return response.data;
}

export async function getEmpresasHelisaDisponibles(): Promise<EmpresaHelisaDisponible[]> {
  const response = await axiosClient.get<EmpresaHelisaDisponible[]>('/empresa/helisa-disponibles');
  return response.data;
}

export async function cambiarEmpresaActiva(payload: CambiarEmpresaActivaPayload): Promise<EmpresaActivaInfo> {
  const response = await axiosClient.put<EmpresaActivaInfo>('/empresa/activa', payload);
  return response.data;
}
