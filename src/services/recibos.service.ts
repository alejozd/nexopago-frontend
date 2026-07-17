import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { ReciboCaja, ReciboCreateDTO } from '../types/recibo.types';

export async function getRecibos(params: PagedParams): Promise<PagedResult<ReciboCaja>> {
  const response = await axiosClient.get<PagedResult<ReciboCaja>>('/recibos', { params });
  return response.data;
}

export async function createRecibo(dto: ReciboCreateDTO): Promise<void> {
  await axiosClient.post('/recibos', dto);
}

export async function anularRecibo(id: number, motivo: string): Promise<void> {
  await axiosClient.put(`/recibos/${id}/anular`, null, { params: { motivo } });
}
