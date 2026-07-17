import { useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { useUsuariosQuery } from '../../hooks/usuarios/useUsuariosQuery';
import { useUsuariosResumenQuery } from '../../hooks/usuarios/useUsuariosResumenQuery';
import { useCambiarEstadoUsuario } from '../../hooks/usuarios/useCambiarEstadoUsuario';
import { KpiCard } from '../../components/common/KpiCard';
import { RowActions } from '../../components/common/RowActions';
import { UsuarioFormDialog } from './UsuarioFormDialog';
import { formatDate } from '../../utils/formatters';
import type { UsuarioListItem } from '../../types/usuario.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };

export function UsuariosPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioListItem | null>(null);
  const { data, isLoading } = useUsuariosQuery(params);
  const { data: resumen } = useUsuariosResumenQuery();
  const cambiarEstadoMutation = useCambiarEstadoUsuario();

  const openCreateDialog = () => {
    setEditingUsuario(null);
    setDialogVisible(true);
  };

  const openEditDialog = (usuario: UsuarioListItem) => {
    setEditingUsuario(usuario);
    setDialogVisible(true);
  };

  const confirmCambiarEstado = (usuario: UsuarioListItem) => {
    const nuevoEstado = !usuario.activo;
    confirmDialog({
      header: nuevoEstado ? 'Activar usuario' : 'Inactivar usuario',
      message: `¿${nuevoEstado ? 'Activar' : 'Inactivar'} a "${usuario.nombreUsuario}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: nuevoEstado ? 'Activar' : 'Inactivar',
      rejectLabel: 'Cancelar',
      accept: () => cambiarEstadoMutation.mutate({ id: usuario.id, activo: nuevoEstado }),
    });
  };

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
    <div>
      <div className="kpi-row">
        <KpiCard
          icon="pi pi-users"
          label="Total Usuarios"
          value={String(resumen?.total ?? 0)}
          accent="primary"
          size="compact"
        />
        <KpiCard
          icon="pi pi-check-circle"
          label="Activos"
          value={String(resumen?.activos ?? 0)}
          accent="success"
          size="compact"
        />
        <KpiCard
          icon="pi pi-shield"
          label="Roles"
          value={String(resumen?.totalRoles ?? 0)}
          accent="warning"
          size="compact"
        />
      </div>

      <Card title="Usuarios">
        <div className="page-header-actions">
          <Button label="Nuevo Usuario" icon="pi pi-plus" onClick={openCreateDialog} />
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
          <Column field="nombreUsuario" header="Usuario" sortable />
          <Column
            header="Nombre Completo"
            body={(row: UsuarioListItem) => `${row.nombre} ${row.apellido}`}
          />
          <Column
            field="roles"
            header="Roles"
            body={(row: UsuarioListItem) => row.roles || '—'}
          />
          <Column
            field="activo"
            header="Estado"
            sortable
            body={(row: UsuarioListItem) => (
              <Tag value={row.activo ? 'Activo' : 'Inactivo'} severity={row.activo ? 'success' : 'danger'} />
            )}
          />
          <Column
            header="Último Acceso"
            body={(row: UsuarioListItem) =>
              row.fechaUltimoAcceso ? formatDate(row.fechaUltimoAcceso) : 'Nunca'
            }
          />
          <Column
            header="Acciones"
            body={(row: UsuarioListItem) => (
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
                    onClick: () => confirmCambiarEstado(row),
                  },
                ]}
              />
            )}
          />
        </DataTable>
      </Card>

      <UsuarioFormDialog visible={dialogVisible} usuario={editingUsuario} onHide={() => setDialogVisible(false)} />
    </div>
  );
}
