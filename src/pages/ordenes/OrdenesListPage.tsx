import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useOrdenesQuery } from '../../hooks/ordenes/useOrdenesQuery';
import { useAnularOrden } from '../../hooks/ordenes/useAnularOrden';
import { StatusTag } from '../../components/common/StatusTag';
import { RowActions } from '../../components/common/RowActions';
import { EntradaFormDialog } from './EntradaFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { OrdenListItem } from '../../types/orden.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };
const ESTADOS_CON_ENTRADA_PENDIENTE = ['BORRADOR', 'PENDIENTE', 'PARCIALMENTE_RECIBIDA'];

export function OrdenesListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [entradaOrdenId, setEntradaOrdenId] = useState<number | null>(null);
  const { data, isLoading } = useOrdenesQuery(params);
  const anularMutation = useAnularOrden();

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

  const confirmAnular = (orden: OrdenListItem) => {
    confirmDialog({
      header: 'Anular orden',
      message: `¿Anular la orden "${orden.numeroOrden}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      accept: () => anularMutation.mutate({ id: orden.id, motivo: '' }),
    });
  };

  return (
    <Card title="Órdenes de Compra">
      <div className="page-header-actions">
        <Button label="Nueva Orden de Compra" icon="pi pi-plus" onClick={() => navigate('/ordenes/nueva')} />
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
        <Column field="numeroOrden" header="Número de Orden" sortable />
        <Column
          field="fechaOrden"
          header="Fecha"
          sortable
          body={(row: OrdenListItem) => formatDate(row.fechaOrden)}
        />
        <Column field="proveedorNombre" header="Proveedor" sortable />
        <Column
          field="estado"
          header="Estado"
          sortable
          body={(row: OrdenListItem) => <StatusTag status={row.estado} />}
        />
        <Column
          field="valorTotal"
          header="Valor Total"
          sortable
          body={(row: OrdenListItem) => formatCurrency(row.valorTotal)}
        />
        <Column
          header="Acciones"
          body={(row: OrdenListItem) => (
            <div className="row-actions">
              <Button
                label="Ver Detalle"
                icon="pi pi-eye"
                text
                onClick={() => navigate(`/ordenes/${row.id}`)}
              />
              <RowActions
                actions={[
                  {
                    icon: 'pi pi-pencil',
                    tooltip:
                      row.estado === 'BORRADOR' || row.estado === 'PENDIENTE'
                        ? 'Editar'
                        : 'Solo se puede editar en BORRADOR o PENDIENTE',
                    severity: 'info',
                    disabled: row.estado !== 'BORRADOR' && row.estado !== 'PENDIENTE',
                    onClick: () => navigate(`/ordenes/${row.id}/editar`),
                  },
                  {
                    icon: 'pi pi-truck',
                    tooltip: ESTADOS_CON_ENTRADA_PENDIENTE.includes(row.estado)
                      ? 'Registrar Entrada'
                      : 'No hay mercancía pendiente de recibir',
                    severity: 'success',
                    disabled: !ESTADOS_CON_ENTRADA_PENDIENTE.includes(row.estado),
                    onClick: () => setEntradaOrdenId(row.id),
                  },
                  {
                    icon: 'pi pi-ban',
                    tooltip: 'Anular',
                    severity: 'danger',
                    disabled: row.estado === 'ANULADA',
                    loading: anularMutation.isPending && anularMutation.variables?.id === row.id,
                    onClick: () => confirmAnular(row),
                  },
                ]}
              />
            </div>
          )}
        />
      </DataTable>

      <EntradaFormDialog
        visible={entradaOrdenId !== null}
        ordenId={entradaOrdenId}
        onHide={() => setEntradaOrdenId(null)}
      />
    </Card>
  );
}
