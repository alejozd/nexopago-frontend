import { axiosClient } from '../api/axiosClient';
import type { HelisaPedidoDetalle, HelisaPedidoResumen } from '../types/helisaPedido.types';

export async function getHelisaPedidosRecientes(): Promise<HelisaPedidoResumen[]> {
  const response = await axiosClient.get<HelisaPedidoResumen[]>('/helisa/pedidos');
  return response.data;
}

export async function getHelisaPedidoDetalle(numeroPedido: string): Promise<HelisaPedidoDetalle> {
  const response = await axiosClient.get<HelisaPedidoDetalle>('/helisa/pedidos/detalle', {
    params: { numero: numeroPedido },
  });
  return response.data;
}
