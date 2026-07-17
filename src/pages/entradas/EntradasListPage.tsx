import { useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { useEntradasQuery } from '../../hooks/entradas/useEntradasQuery';
import { formatDate, formatDateTime } from '../../utils/formatters';
import type { EntradaMercancia } from '../../types/entrada.types';
import type { PagedParams } from '../../types/common.types';
import '../../assets/styles/entradas.css';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20, sortField: 'fechaEntrada', sortOrder: -1 };

export function EntradasListPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const { data, isLoading } = useEntradasQuery(params);

  const onPage = (event: DataTablePageEvent) => {
    setParams((prev) => ({ ...prev, page: (event.page ?? 0) + 1, rows: event.rows }));
  };

  const onSort = (event: DataTableSortEvent) => {
    setParams((prev) => ({
      ...prev,
      sortField: event.sortField || undefined,
      sortOrder: (event.sortOrder as 1 | -1 | null) ?? undefined,
    }));
  };

  return (
    <Card title="Entradas de Mercancía">
      <p className="entradas-subtitle">
        Historial de entradas registradas desde Órdenes de Compra, para auditoría. Para registrar una nueva entrada,
        ve al detalle de la orden correspondiente.
      </p>

      <DataTable
        value={data?.data ?? []}
        loading={isLoading}
        stripedRows
        lazy
        paginator
        first={(params.page - 1) * params.rows}
        rows={params.rows}
        totalRecords={data?.totalRecords ?? 0}
        onPage={onPage}
        onSort={onSort}
        sortField={params.sortField}
        sortOrder={params.sortOrder}
        dataKey="id"
      >
        <Column field="numeroEntradaHelisa" header="N° Entrada Helisa" sortable />
        <Column
          field="fechaEntrada"
          header="Fecha de Entrada"
          sortable
          body={(row: EntradaMercancia) => formatDate(row.fechaEntrada)}
        />
        <Column field="numeroOrden" header="Orden" sortable />
        <Column field="proveedorNombre" header="Proveedor" sortable />
        <Column
          field="fechaCreacion"
          header="Registrada el"
          sortable
          body={(row: EntradaMercancia) => formatDateTime(row.fechaCreacion)}
        />
        <Column
          field="usuarioCreoNombre"
          header="Registrada por"
          body={(row: EntradaMercancia) => row.usuarioCreoNombre || '—'}
        />
        <Column
          field="observaciones"
          header="Observaciones"
          body={(row: EntradaMercancia) => row.observaciones ?? '—'}
        />
      </DataTable>
    </Card>
  );
}
