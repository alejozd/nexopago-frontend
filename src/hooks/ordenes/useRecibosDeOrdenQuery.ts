import { useQuery } from '@tanstack/react-query';
import { getRecibos } from '../../services/recibos.service';

// GET /api/recibos no admite filtro por orden todavia (solo page/rows/
// sortField/sortOrder): se trae un lote grande y se filtra en el cliente por
// numeroOrden. Workaround acordado para la Parte 1 de Ordenes; se reemplaza
// por un filtro server-side cuando el backend lo exponga.
export function useRecibosDeOrdenQuery(numeroOrden: string | undefined, habilitado = true) {
  return useQuery({
    queryKey: ['recibos', 'por-orden', numeroOrden],
    queryFn: async () => {
      const result = await getRecibos({ page: 1, rows: 500, sortField: 'fechaRecibo', sortOrder: -1 });
      return result.data.filter((recibo) => recibo.numeroOrden === numeroOrden);
    },
    enabled: numeroOrden !== undefined && habilitado,
  });
}
