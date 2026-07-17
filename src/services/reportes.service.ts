import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type { CarteraItem, CarteraProveedor } from '../types/reporte.types';

export async function getCartera(params: PagedParams): Promise<PagedResult<CarteraItem>> {
  const response = await axiosClient.get<PagedResult<CarteraItem>>('/reportes/cartera', { params });
  return response.data;
}

export async function getCarteraPorProveedor(params: PagedParams): Promise<PagedResult<CarteraProveedor>> {
  const response = await axiosClient.get<PagedResult<CarteraProveedor>>('/reportes/cartera/por-proveedor', {
    params,
  });
  return response.data;
}
