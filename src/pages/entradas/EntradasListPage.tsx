import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTablePageEvent, type DataTableRowClickEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { useEntradasQuery } from '../../hooks/entradas/useEntradasQuery';
import { useEntradasResumenQuery } from '../../hooks/entradas/useEntradasResumenQuery';
import { KpiCard } from '../../components/common/KpiCard';
import { useAuthStore } from '../../store/authStore';
import { hasPermiso } from '../../utils/permisos';
import { BuscarOrdenPendienteDialog } from './BuscarOrdenPendienteDialog';
import { EntradaFormDialog } from '../ordenes/EntradaFormDialog';
import { formatDate, formatDateTime } from '../../utils/formatters';
import type { EntradaMercancia } from '../../types/entrada.types';
import type { PagedParams } from '../../types/common.types';
import '../../assets/styles/entradas.css';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20, sortField: 'fechaEntrada', sortOrder: -1 };
const SEARCH_DEBOUNCE_MS = 400;

export function EntradasListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<PagedParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading } = useEntradasQuery(params);
  const { data: resumen } = useEntradasResumenQuery();

  const usuario = useAuthStore((state) => state.usuario);
  const puedeRegistrarEntrada = hasPermiso(usuario?.permisos, 'CHIPIS:ENTRADAS_REGISTRAR');
  // Un perfil de "solo entradas" no tiene CHIPIS:ORDENES_LEER: el historial
  // no debe navegar a /ordenes/:id (ruta protegida, terminaria en
  // /sin-acceso) ni verse "clickable" para ese usuario.
  const puedeVerOrdenes = hasPermiso(usuario?.permisos, 'CHIPIS:ORDENES_LEER');

  const [buscarVisible, setBuscarVisible] = useState(false);
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState<number | null>(null);

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

  const onRowClick = puedeVerOrdenes
    ? (event: DataTableRowClickEvent) => {
        const entrada = event.data as EntradaMercancia;
        navigate(`/ordenes/${entrada.ordenId}`);
      }
    : undefined;

  const onConfirmBuscarOrden = (id: number) => {
    setOrdenSeleccionadaId(id);
    setBuscarVisible(false);
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

      <Card>
      <div className="entradas-header">
        <h2 className="entradas-title">Entradas de Mercancía</h2>
        <div className="entradas-header-acciones">
          <IconField iconPosition="left" className="entradas-search">
            <InputIcon className="pi pi-search" />
            <InputText
              placeholder="Buscar por N° de entrada, orden o proveedor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </IconField>
          {puedeRegistrarEntrada && (
            <Button label="Registrar Entrada" icon="pi pi-truck" severity="success" onClick={() => setBuscarVisible(true)} />
          )}
        </div>
      </div>

      <p className="entradas-subtitle">
        Historial de entradas registradas desde Órdenes de Compra, para auditoría.
        {puedeRegistrarEntrada
          ? ' Usa "Registrar Entrada" para buscar una orden pendiente y recibirla, o hazlo desde el detalle de la orden correspondiente.'
          : ' Para registrar una nueva entrada, ve al detalle de la orden correspondiente.'}
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
        rowClassName={() => (puedeVerOrdenes ? 'entradas-row-clickable' : '')}
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

      <BuscarOrdenPendienteDialog
        visible={buscarVisible}
        onHide={() => setBuscarVisible(false)}
        onConfirm={onConfirmBuscarOrden}
      />
      <EntradaFormDialog
        visible={ordenSeleccionadaId !== null}
        ordenId={ordenSeleccionadaId}
        onHide={() => setOrdenSeleccionadaId(null)}
      />
    </div>
  );
}
