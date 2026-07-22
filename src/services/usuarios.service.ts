import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type {
  CambiarPasswordDTO,
  UsuarioCreateDTO,
  UsuarioListItem,
  UsuarioUpdateDTO,
  UsuariosResumen,
} from '../types/usuario.types';

export async function getUsuarios(params: PagedParams): Promise<PagedResult<UsuarioListItem>> {
  const response = await axiosClient.get<PagedResult<UsuarioListItem>>('/usuarios', { params });
  return response.data;
}

export async function getUsuariosResumen(): Promise<UsuariosResumen> {
  const response = await axiosClient.get<UsuariosResumen>('/usuarios/resumen');
  return response.data;
}

export async function createUsuario(dto: UsuarioCreateDTO): Promise<void> {
  await axiosClient.post('/usuarios', dto);
}

export async function updateUsuario(id: number, dto: UsuarioUpdateDTO): Promise<void> {
  await axiosClient.put(`/usuarios/${id}`, dto);
}

export async function cambiarEstadoUsuario(id: number, activo: boolean): Promise<void> {
  await axiosClient.put(`/usuarios/${id}/estado`, null, { params: { activo } });
}

export async function cambiarPasswordUsuario(id: number, dto: CambiarPasswordDTO): Promise<void> {
  await axiosClient.put(`/usuarios/${id}/password`, dto);
}
