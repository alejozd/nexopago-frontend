import { useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { useRecibosQuery } from '../../hooks/recibos/useRecibosQuery';
import { useRecibosResumenQuery } from '../../hooks/recibos/useRecibosResumenQuery';
import { useAnularRecibo } from '../../hooks/recibos/useAnularRecibo';
import { StatusTag } from '../../components/common/StatusTag';
import { RowActions } from '../../components/common/RowActions';
import { KpiCard } from '../../components/common/KpiCard';
import { ReciboFormDialog } from './ReciboFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { ReciboCaja } from '../../types/recibo.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };

export function RecibosListPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [dialogVisible, setDialogVisible] = useState(false);
  const { data, isLoading } = useRecibosQuery(params);
  const { data: resumen } = useRecibosResumenQuery();
  const anularMutation = useAnularRecibo();

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

  const confirmAnular = (recibo: ReciboCaja) => {
    confirmDialog({
      header: 'Anular recibo',
      message: `¿Anular el recibo "${recibo.numeroRecibo}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      accept: () => anularMutation.mutate({ id: recibo.id, motivo: '' }),
    });
  };

  return (
    <div>
      <div className="kpi-row">
        <KpiCard icon="pi pi-receipt" label="Total Recibos" value={String(resumen?.total ?? 0)} accent="primary" />
        <KpiCard icon="pi pi-check-circle" label="Activos" value={String(resumen?.activos ?? 0)} accent="success" />
        <KpiCard icon="pi pi-ban" label="Anulados" value={String(resumen?.anulados ?? 0)} accent="danger" />
        <KpiCard icon="pi pi-wallet" label="Monto Total" value={formatCurrency(resumen?.montoTotal ?? 0)} accent="warning" />
      </div>

      <Card title="Recibos de Caja">
      <div className="page-header-actions">
        <Button label="Nuevo Recibo" icon="pi pi-plus" onClick={() => setDialogVisible(true)} />
      </div>

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
        <Column field="numeroRecibo" header="N° Recibo" sortable />
        <Column
          field="fechaRecibo"
          header="Fecha"
          sortable
          body={(row: ReciboCaja) => formatDate(row.fechaRecibo)}
        />
        <Column field="numeroOrden" header="Orden" sortable />
        <Column field="proveedorNombre" header="Proveedor" sortable />
        <Column field="monto" header="Valor" sortable body={(row: ReciboCaja) => formatCurrency(row.monto)} />
        <Column
          field="tipoPago"
          header="Tipo de Pago"
          body={(row: ReciboCaja) => (
            <Tag value={row.tipoPago} severity={row.tipoPago === 'TOTAL' ? 'success' : 'info'} />
          )}
        />
        <Column field="estado" header="Estado" body={(row: ReciboCaja) => <StatusTag status={row.estado} />} />
        <Column
          header="Acciones"
          body={(row: ReciboCaja) => (
            <RowActions
              actions={[
                {
                  icon: 'pi pi-ban',
                  tooltip: 'Anular',
                  severity: 'danger',
                  disabled: row.estado === 'ANULADO',
                  loading: anularMutation.isPending && anularMutation.variables?.id === row.id,
                  onClick: () => confirmAnular(row),
                },
              ]}
            />
          )}
        />
      </DataTable>

      <ReciboFormDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
      </Card>
    </div>
  );
}
