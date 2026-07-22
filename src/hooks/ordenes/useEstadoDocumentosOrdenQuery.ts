import { useQuery } from '@tanstack/react-query';
import { getEstadoDocumentosOrden } from '../../services/ordenes.service';

// Resumen agregado (conteos + ultima fecha) de entradas/recibos de una orden,
// usado como fallback de trazabilidad cuando el usuario NO tiene el permiso
// fino (CHIPIS:ENTRADAS_LEER / CHIPIS:RECIBOS_LEER) para ver el detalle
// completo. Protegido en backend solo por CHIPIS:ORDENES_LEER (el mismo
// permiso que ya usa el detalle de la orden), asi que solo se pide cuando
// realmente falta alguno de los permisos finos (ver `habilitado` en
// OrdenDetallePage).
export function useEstadoDocumentosOrdenQuery(ordenId: number | undefined, habilitado: boolean) {
  return useQuery({
    queryKey: ['ordenes', 'estado-documentos', ordenId],
    queryFn: () => getEstadoDocumentosOrden(ordenId as number),
    enabled: ordenId !== undefined && habilitado,
  });
}
