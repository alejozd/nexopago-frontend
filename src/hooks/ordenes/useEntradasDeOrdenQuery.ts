import { useQuery } from '@tanstack/react-query';
import { getEntradas } from '../../services/entradas.service';

// GET /api/entradas no admite filtro por orden todavia (solo page/rows/
// sortField/sortOrder): se trae un lote grande y se filtra en el cliente por
// ordenId. Mismo workaround que useRecibosDeOrdenQuery. Puede haber mas de
// una entrada por orden (entregas parciales: el backend solo bloquea una
// nueva entrada si la orden ya quedo RECIBIDA por completo, ver
// TEntradasMercanciaService.RegistrarEntrada), asi que se retornan todas.
export function useEntradasDeOrdenQuery(ordenId: number | undefined, habilitado = true) {
  return useQuery({
    queryKey: ['entradas', 'por-orden', ordenId],
    queryFn: async () => {
      const result = await getEntradas({ page: 1, rows: 500, sortField: 'fechaEntrada', sortOrder: -1 });
      return result.data.filter((entrada) => entrada.ordenId === ordenId);
    },
    enabled: ordenId !== undefined && habilitado,
  });
}
