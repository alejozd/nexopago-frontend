import { axiosClient } from '../api/axiosClient';
import type { EmpresaActual } from '../types/empresa.types';

export async function getEmpresaActual(): Promise<EmpresaActual> {
  const response = await axiosClient.get<EmpresaActual>('/empresa/actual');
  return response.data;
}
