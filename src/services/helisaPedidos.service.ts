import { axiosClient } from '../api/axiosClient';
import type { HelisaPedidoDetalle, HelisaPedidoResumen } from '../types/helisaPedido.types';

export async function getHelisaPedidosRecientes(): Promise<HelisaPedidoResumen[]> {
  const response = await axiosClient.get<HelisaPedidoResumen[]>('/helisa/pedidos');
  return response.data;
}

export async function getHelisaPedidoDetalle(numeroPedido: string, ordenId?: number): Promise<HelisaPedidoDetalle> {
  // ordenId solo se manda cuando se edita una orden existente que ya viene de
  // este mismo pedido: el backend excluye las lineas de esa orden al calcular
  // el saldo, para que la orden no se autobloquee contando sus propias lineas
  // ya guardadas en contra de si misma. Al crear una orden nueva no se manda.
  const params: Record<string, string | number> = { numero: numeroPedido };
  if (ordenId !== undefined && ordenId !== null) {
    params.ordenId = ordenId;
  }
  const response = await axiosClient.get<HelisaPedidoDetalle>('/helisa/pedidos/detalle', { params });
  return response.data;
}
