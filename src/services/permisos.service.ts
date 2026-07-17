import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { Modulo, Perfil, Permiso, PermisoMatrizItem } from '../types/permiso.types';

export async function getModulos(params: PagedParams): Promise<PagedResult<Modulo>> {
  const response = await axiosClient.get<PagedResult<Modulo>>('/modulos', { params });
  return response.data;
}

export async function getPerfiles(params: PagedParams): Promise<PagedResult<Perfil>> {
  const response = await axiosClient.get<PagedResult<Perfil>>('/perfiles', { params });
  return response.data;
}

export async function getPermisos(params: PagedParams): Promise<PagedResult<Permiso>> {
  const response = await axiosClient.get<PagedResult<Permiso>>('/permisos', { params });
  return response.data;
}

export async function getMatriz(perfilId: number): Promise<PermisoMatrizItem[]> {
  // GetMatriz retorna un TObjectList<T> directo, no el envelope {data,totalRecords}.
  const response = await axiosClient.get<PermisoMatrizItem[]>(`/perfiles/${perfilId}/permisos`);
  return response.data;
}

export async function asignarPermisos(perfilId: number, permisoIds: number[]): Promise<void> {
  await axiosClient.put(`/perfiles/${perfilId}/permisos`, { permisoIds });
}
