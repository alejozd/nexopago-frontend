import { axiosClient } from '../api/axiosClient';
import type { PagedParams, PagedResult } from '../types/common.types';
import type {
  OrdenCreateDTO,
  OrdenDetalle,
  OrdenEstadoDocumentos,
  OrdenesResumen,
  OrdenListItem,
  OrdenPendienteRecepcion,
  OrdenPendientePago,
  OrdenRecepcion,
  OrdenSaldo,
} from '../types/orden.types';

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

export async function getEstadoDocumentosOrden(id: number): Promise<OrdenEstadoDocumentos> {
  const response = await axiosClient.get<OrdenEstadoDocumentos>(`/ordenes/${id}/estado-documentos`);
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

// Endpoints angostos para el flujo de "solo registrar entradas" (perfiles con
// CHIPIS:ENTRADAS_REGISTRAR pero sin CHIPIS:ORDENES_LEER): sin datos
// financieros ni de proveedor mas alla del nombre.
export async function getOrdenesPendientesRecepcion(
  params: PagedParams,
): Promise<PagedResult<OrdenPendienteRecepcion>> {
  const response = await axiosClient.get<PagedResult<OrdenPendienteRecepcion>>('/ordenes/pendientes-recepcion', {
    params,
  });
  return response.data;
}

export async function getOrdenDetalleRecepcion(id: number): Promise<OrdenRecepcion> {
  const response = await axiosClient.get<OrdenRecepcion>(`/ordenes/${id}/detalle-recepcion`);
  return response.data;
}

// Endpoints angostos para el flujo de "solo Recibos de Caja" (perfiles con
// CHIPIS:RECIBOS_* pero sin CHIPIS:ORDENES_LEER): sin datos financieros
// completos ni lineas de producto.
export async function getOrdenesPendientesPago(params: PagedParams): Promise<PagedResult<OrdenPendientePago>> {
  const response = await axiosClient.get<PagedResult<OrdenPendientePago>>('/ordenes/pendientes-pago', { params });
  return response.data;
}

export async function getOrdenSaldo(id: number): Promise<OrdenSaldo> {
  const response = await axiosClient.get<OrdenSaldo>(`/ordenes/${id}/detalle-saldo`);
  return response.data;
}
