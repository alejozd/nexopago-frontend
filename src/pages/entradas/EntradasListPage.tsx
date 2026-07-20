import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTablePageEvent, type DataTableRowClickEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { useEntradasQuery } from '../../hooks/entradas/useEntradasQuery';
import { useEntradasResumenQuery } from '../../hooks/entradas/useEntradasResumenQuery';
import { KpiCard } from '../../components/common/KpiCard';
import { formatDate, formatDateTime } from '../../utils/formatters';
import type { EntradaMercancia } from '../../types/entrada.types';
import type { PagedParams } from '../../types/common.types';
import '../../assets/styles/entradas.css';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20, sortField: 'fechaEntrada', sortOrder: -1 };

export function EntradasListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const { data, isLoading } = useEntradasQuery(params);
  const { data: resumen } = useEntradasResumenQuery();

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

  const onRowClick = (event: DataTableRowClickEvent) => {
    const entrada = event.data as EntradaMercancia;
    navigate(`/ordenes/${entrada.ordenId}`);
  };

  return (
    <div>
      <div className="kpi-row">
        <KpiCard icon="pi pi-truck" label="Total Entradas" value={String(resumen?.total ?? 0)} accent="primary" size="compact" />
        <KpiCard icon="pi pi-calendar" label="Último Mes" value={String(resumen?.ultimoMes ?? 0)} accent="success" size="compact" />
        <KpiCard
          icon="pi pi-file"
          label="Órdenes Asociadas"
          value={String(resumen?.ordenesAsociadas ?? 0)}
          accent="warning"
          size="compact"
        />
      </div>

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
        onRowClick={onRowClick}
        rowClassName={() => 'entradas-row-clickable'}
      >
        <Column field="numeroEntradaHelisa" header="N° Entrada ERP" sortable />
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
    </div>
  );
}
