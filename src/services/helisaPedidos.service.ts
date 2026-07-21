import { axiosClient } from '../api/axiosClient';
import type { HelisaPedidoDetalle, HelisaPedidoResumen } from '../types/helisaPedido.types';

// desde/hasta (formato YYYY-MM-DD): si no se mandan, el backend usa su
// default de ultimos 60 dias.
export async function getHelisaPedidosRecientes(desde?: string, hasta?: string): Promise<HelisaPedidoResumen[]> {
  const params: Record<string, string> = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const response = await axiosClient.get<HelisaPedidoResumen[]>('/helisa/pedidos', { params });
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
