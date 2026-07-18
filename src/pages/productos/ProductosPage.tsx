import { useEffect, useState } from 'react';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { useProductosQuery } from '../../hooks/productos/useProductosQuery';
import { useSincronizarProductos } from '../../hooks/productos/useSincronizarProductos';
import { KpiCard } from '../../components/common/KpiCard';
import { formatCurrency } from '../../utils/formatters';
import type { Producto } from '../../types/producto.types';
import type { PagedParams } from '../../types/common.types';
import '../../assets/styles/productos.css';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };
const SEARCH_DEBOUNCE_MS = 400;

export function ProductosPage() {
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useProductosQuery(params);
  const sincronizarMutation = useSincronizarProductos();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setParams((prev) => ({ ...prev, page: 1, search: searchInput || undefined }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

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
    <Card title="Productos">
      <div className="productos-toolbar">
        <div className="productos-total-kpi">
          <KpiCard icon="pi pi-box" label="Total de productos" value={String(data?.totalRecords ?? 0)} accent="primary" size="compact" />
        </div>

        <div className="productos-toolbar" style={{ marginBottom: 0 }}>
          <IconField iconPosition="left" className="productos-search">
            <InputIcon className="pi pi-search" />
            <InputText
              placeholder="Buscar por descripción o código interno..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </IconField>
          <Button
            label="Sincronizar"
            icon="pi pi-sync"
            loading={sincronizarMutation.isPending}
            onClick={() => sincronizarMutation.mutate()}
          />
        </div>
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
        <Column field="codigoHelisa" header="Código Helisa" sortable />
        <Column field="subCodigoHelisa" header="Subcódigo" />
        <Column field="codigoInterno" header="Código Interno" body={(row: Producto) => row.codigoInterno ?? '—'} />
        <Column field="descripcion" header="Descripción" sortable />
        <Column field="unidadMedida" header="Unidad" body={(row: Producto) => row.unidadMedida ?? '—'} />
        <Column
          field="precioReferencia"
          header="Precio Ref."
          body={(row: Producto) => (row.precioReferencia != null ? formatCurrency(row.precioReferencia) : '—')}
        />
        <Column
          field="activo"
          header="Estado"
          sortable
          body={(row: Producto) => (
            <Tag value={row.activo ? 'Activo' : 'Inactivo'} severity={row.activo ? 'success' : 'danger'} />
          )}
        />
      </DataTable>
    </Card>
  );
}
