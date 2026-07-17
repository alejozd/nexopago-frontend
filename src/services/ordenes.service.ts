import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { OrdenCreateDTO, OrdenDetalle, OrdenesResumen, OrdenListItem } from '../types/orden.types';

export async function getOrdenes(params: PagedParams): Promise<PagedResult<OrdenListItem>> {
  const response = await axiosClient.get<PagedResult<OrdenListItem>>('/ordenes', { params });
  return response.data;
}

export async function getOrdenesResumen(): Promise<OrdenesResumen> {
  const response = await axiosClient.get<OrdenesResumen>('/ordenes/resumen');
  return response.data;
}

export async function getOrdenById(id: number): Promise<OrdenDetalle> {
  const response = await axiosClient.get<OrdenDetalle>(`/ordenes/${id}`);
  return response.data;
}

export async function createOrden(dto: OrdenCreateDTO): Promise<{ id: number }> {
  // CreatedResponse(location, AnObject) envuelve el body en { data: {...} }
  // (mismo envelope que OKResponse), a diferencia de los listados paginados
  // que se retornan sin envolver.
  const response = await axiosClient.post<{ data: { id: number } }>('/ordenes', dto);
  return { id: response.data.data.id };
}

export async function updateOrden(id: number, dto: OrdenCreateDTO): Promise<void> {
  await axiosClient.put(`/ordenes/${id}`, dto);
}

export async function anularOrden(id: number, motivo: string): Promise<void> {
  await axiosClient.put(`/ordenes/${id}/anular`, null, { params: { motivo } });
}
