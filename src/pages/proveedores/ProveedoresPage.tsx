import { useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { useProveedoresQuery } from '../../hooks/proveedores/useProveedoresQuery';
import { useCambiarEstadoProveedor } from '../../hooks/proveedores/useCambiarEstadoProveedor';
import { useDeleteProveedor } from '../../hooks/proveedores/useDeleteProveedor';
import { RowActions } from '../../components/common/RowActions';
import { ProveedorFormDialog } from './ProveedorFormDialog';
import type { Proveedor } from '../../types/proveedor.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };

export function ProveedoresPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  const { data, isLoading } = useProveedoresQuery(params);
  const cambiarEstadoMutation = useCambiarEstadoProveedor();
  const deleteMutation = useDeleteProveedor();

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

  const openCreateDialog = () => {
    setEditingProveedor(null);
    setDialogVisible(true);
  };

  const openEditDialog = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setDialogVisible(true);
  };

  const confirmDelete = (proveedor: Proveedor) => {
    confirmDialog({
      header: 'Eliminar proveedor',
      message: `¿Eliminar a "${proveedor.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => deleteMutation.mutate(proveedor.id),
    });
  };

  return (
    <Card title="Proveedores">
      <div className="page-header-actions">
        <Button label="Nuevo Proveedor" icon="pi pi-plus" onClick={openCreateDialog} />
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
        <Column field="nit" header="NIT" sortable />
        <Column field="nombre" header="Nombre" sortable />
        <Column field="telefono" header="Teléfono" />
        <Column field="correoElectronico" header="Correo" />
        <Column
          field="activo"
          header="Estado"
          body={(row: Proveedor) => (
            <Tag value={row.activo ? 'Activo' : 'Inactivo'} severity={row.activo ? 'success' : 'danger'} />
          )}
        />
        <Column
          header="Acciones"
          body={(row: Proveedor) => (
            <RowActions
              actions={[
                {
                  icon: 'pi pi-pencil',
                  tooltip: 'Editar',
                  severity: 'info',
                  onClick: () => openEditDialog(row),
                },
                {
                  icon: 'pi pi-sync',
                  tooltip: row.activo ? 'Inactivar' : 'Activar',
                  severity: row.activo ? 'warning' : 'success',
                  loading: cambiarEstadoMutation.isPending && cambiarEstadoMutation.variables?.id === row.id,
                  onClick: () => cambiarEstadoMutation.mutate({ id: row.id, activo: !row.activo }),
                },
                {
                  icon: 'pi pi-trash',
                  tooltip: 'Eliminar',
                  severity: 'danger',
                  loading: deleteMutation.isPending && deleteMutation.variables === row.id,
                  onClick: () => confirmDelete(row),
                },
              ]}
            />
          )}
        />
      </DataTable>

      <ProveedorFormDialog
        visible={dialogVisible}
        proveedor={editingProveedor}
        onHide={() => setDialogVisible(false)}
      />
    </Card>
  );
}
