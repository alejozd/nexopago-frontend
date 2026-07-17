import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { EntradaCreateDTO, EntradaMercancia, EntradasResumen } from '../types/entrada.types';

export async function getEntradas(params: PagedParams): Promise<PagedResult<EntradaMercancia>> {
  const response = await axiosClient.get<PagedResult<EntradaMercancia>>('/entradas', { params });
  return response.data;
}

export async function getEntradasResumen(): Promise<EntradasResumen> {
  const response = await axiosClient.get<EntradasResumen>('/entradas/resumen');
  return response.data;
}

export async function createEntrada(dto: EntradaCreateDTO): Promise<void> {
  await axiosClient.post('/entradas', dto);
}
