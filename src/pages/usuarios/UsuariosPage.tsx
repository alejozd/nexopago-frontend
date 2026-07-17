import { useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { useUsuariosQuery } from '../../hooks/usuarios/useUsuariosQuery';
import { useUsuariosResumenQuery } from '../../hooks/usuarios/useUsuariosResumenQuery';
import { KpiCard } from '../../components/common/KpiCard';
import { formatDate } from '../../utils/formatters';
import type { UsuarioListItem } from '../../types/usuario.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };

export function UsuariosPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const { data, isLoading } = useUsuariosQuery(params);
  const { data: resumen } = useUsuariosResumenQuery();

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
        <KpiCard icon="pi pi-users" label="Total Usuarios" value={String(resumen?.total ?? 0)} accent="primary" />
        <KpiCard icon="pi pi-check-circle" label="Activos" value={String(resumen?.activos ?? 0)} accent="success" />
        <KpiCard icon="pi pi-shield" label="Roles" value={String(resumen?.totalRoles ?? 0)} accent="warning" />
      </div>

      <Card title="Usuarios">
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
        </DataTable>
      </Card>
    </div>
  );
}
