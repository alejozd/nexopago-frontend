import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { Proveedor, ProveedorCreateDTO, ProveedoresResumen } from '../types/proveedor.types';

export async function getProveedores(params: PagedParams): Promise<PagedResult<Proveedor>> {
  const response = await axiosClient.get<PagedResult<Proveedor>>('/proveedores', { params });
  return response.data;
}

export async function getProveedoresResumen(): Promise<ProveedoresResumen> {
  const response = await axiosClient.get<ProveedoresResumen>('/proveedores/resumen');
  return response.data;
}

export async function createProveedor(dto: ProveedorCreateDTO): Promise<void> {
  await axiosClient.post('/proveedores', dto);
}

export async function updateProveedor(id: number, dto: ProveedorCreateDTO): Promise<void> {
  await axiosClient.put(`/proveedores/${id}`, dto);
}

export async function cambiarEstadoProveedor(id: number, activo: boolean): Promise<void> {
  await axiosClient.put(`/proveedores/${id}/estado`, null, { params: { activo } });
}

export async function deleteProveedor(id: number): Promise<void> {
  await axiosClient.delete(`/proveedores/${id}`);
}
