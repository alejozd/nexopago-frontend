import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { UsuarioListItem, UsuariosResumen } from '../types/usuario.types';

export async function getUsuarios(params: PagedParams): Promise<PagedResult<UsuarioListItem>> {
  const response = await axiosClient.get<PagedResult<UsuarioListItem>>('/usuarios', { params });
  return response.data;
}

export async function getUsuariosResumen(): Promise<UsuariosResumen> {
  const response = await axiosClient.get<UsuariosResumen>('/usuarios/resumen');
  return response.data;
}
