import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { Producto, SincronizacionResumen } from '../types/producto.types';

export async function getProductos(params: PagedParams): Promise<PagedResult<Producto>> {
  const response = await axiosClient.get<PagedResult<Producto>>('/productos', { params });
  return response.data;
}

export async function sincronizarProductos(): Promise<SincronizacionResumen> {
  const response = await axiosClient.post<SincronizacionResumen>('/productos/sincronizar');
  return response.data;
}
