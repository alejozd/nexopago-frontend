import { axiosClient } from '../api/axiosClient';
import type { EntradaCreateDTO } from '../types/entrada.types';

export async function createEntrada(dto: EntradaCreateDTO): Promise<void> {
  await axiosClient.post('/entradas', dto);
}
