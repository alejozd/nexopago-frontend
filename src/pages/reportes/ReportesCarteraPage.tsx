import { useState } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useCarteraQuery } from '../../hooks/reportes/useCarteraQuery';
import { useCarteraPorProveedorQuery } from '../../hooks/reportes/useCarteraPorProveedorQuery';
import { useCarteraResumenQuery } from '../../hooks/reportes/useCarteraResumenQuery';
import { getCartera, getCarteraPorProveedor } from '../../services/reportes.service';
import { KpiCard } from '../../components/common/KpiCard';
import { exportToExcel } from '../../utils/exportExcel';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { CarteraItem, CarteraProveedor } from '../../types/reporte.types';
import type { PagedParams } from '../../types/common.types';

const DEFAULT_PARAMS: PagedParams = { page: 1, rows: 20 };
// Las tablas son paginadas en servidor: para exportar el reporte completo
// (no solo la pagina visible) se pide una sola vez con un limite alto sobre
// el mismo endpoint paginado, sin tocar la paginacion de la tabla en pantalla.
const EXPORT_ROWS = 5000;

const RANGO_SEVERITY: Record<string, 'success' | 'warning' | 'danger'> = {
  '0-30': 'success',
  '31-60': 'warning',
  '61-90': 'warning',
  '90+': 'danger',
};

export function ReportesCarteraPage() {
  const [paramsGeneral, setParamsGeneral] = useState<PagedParams>(DEFAULT_PARAMS);
  const [paramsProveedor, setParamsProveedor] = useState<PagedParams>(DEFAULT_PARAMS);
  const [isExportingGeneral, setIsExportingGeneral] = useState(false);
  const [isExportingProveedor, setIsExportingProveedor] = useState(false);

  const { data: cartera, isLoading: isLoadingCartera } = useCarteraQuery(paramsGeneral);
  const { data: carteraProveedor, isLoading: isLoadingProveedor } = useCarteraPorProveedorQuery(paramsProveedor);
  const { data: resumen } = useCarteraResumenQuery();

  const handleExportGeneral = async () => {
    setIsExportingGeneral(true);
    try {
      const resultado = await getCartera({
        page: 1,
        rows: EXPORT_ROWS,
        sortField: paramsGeneral.sortField,
        sortOrder: paramsGeneral.sortOrder,
      });
      exportToExcel(
        resultado.data.map((item) => ({
          Orden: item.numeroOrden,
          Fecha: formatDate(item.fechaOrden),
          Proveedor: item.proveedorNombre,
          'Valor Total': item.valorTotal,
          Pagado: item.montoPagado,
          'Saldo Pendiente': item.saldoPendiente,
          'Días Antigüedad': item.diasAntiguedad,
          Rango: item.rangoAntiguedad,
        })),
        'cartera-general',
        'Cartera',
      );
    } finally {
      setIsExportingGeneral(false);
    }
  };

  const handleExportProveedor = async () => {
    setIsExportingProveedor(true);
    try {
      const resultado = await getCarteraPorProveedor({
        page: 1,
        rows: EXPORT_ROWS,
        sortField: paramsProveedor.sortField,
        sortOrder: paramsProveedor.sortOrder,
      });
      exportToExcel(
        resultado.data.map((item) => ({
          Proveedor: item.proveedorNombre,
          'Órdenes con Saldo': item.cantidadOrdenes,
          'Saldo Total': item.saldoPendienteTotal,
        })),
        'cartera-por-proveedor',
        'Cartera por Proveedor',
      );
    } finally {
      setIsExportingProveedor(false);
    }
  };

  const onPageGeneral = (event: DataTablePageEvent) => {
    setParamsGeneral((prev) => ({ ...prev, page: (event.page ?? 0) + 1, rows: event.rows }));
  };
  const onSortGeneral = (event: DataTableSortEvent) => {
    setParamsGeneral((prev) => ({
      ...prev,
      sortField: event.sortField || undefined,
      sortOrder: (event.sortOrder as 1 | -1 | null) ?? undefined,
    }));
  };

  const onPageProveedor = (event: DataTablePageEvent) => {
    setParamsProveedor((prev) => ({ ...prev, page: (event.page ?? 0) + 1, rows: event.rows }));
  };
  const onSortProveedor = (event: DataTableSortEvent) => {
    setParamsProveedor((prev) => ({
      ...prev,
      sortField: event.sortField || undefined,
      sortOrder: (event.sortOrder as 1 | -1 | null) ?? undefined,
    }));
  };

  return (
    <div>
      <div className="kpi-row">
        <KpiCard
          icon="pi pi-wallet"
          label="Total Cartera Pendiente"
          value={formatCurrency(resumen?.totalPendiente ?? 0)}
          accent="primary"
        />
        <KpiCard
          icon="pi pi-file"
          label="Órdenes con Saldo"
          value={String(resumen?.cantidadOrdenesConSaldo ?? 0)}
          accent="warning"
        />
        <KpiCard
          icon="pi pi-clock"
          label="Orden Más Antigua"
          value={resumen?.ordenMasAntiguaNumero ? `${resumen.ordenMasAntiguaNumero} (${resumen.ordenMasAntiguaDias}d)` : '—'}
          accent="danger"
        />
        <KpiCard
          icon="pi pi-building"
          label="Proveedor con Mayor Deuda"
          value={resumen?.proveedorMayorDeudaNombre ?? '—'}
          accent="success"
        />
      </div>

      <Card title="Reportes de Cartera">
      <TabView>
        <TabPanel header="General">
          <div className="page-header-actions">
            <Button
              label="Exportar a Excel"
              icon="pi pi-file-excel"
              outlined
              loading={isExportingGeneral}
              onClick={handleExportGeneral}
            />
          </div>
          <DataTable
            value={cartera?.data ?? []}
            loading={isLoadingCartera}
            stripedRows
            lazy
            paginator
            first={(paramsGeneral.page - 1) * paramsGeneral.rows}
            rows={paramsGeneral.rows}
            totalRecords={cartera?.totalRecords ?? 0}
            onPage={onPageGeneral}
            onSort={onSortGeneral}
            sortField={paramsGeneral.sortField}
            sortOrder={paramsGeneral.sortOrder}
            dataKey="id"
          >
            <Column field="numeroOrden" header="Orden" sortable />
            <Column
              field="fechaOrden"
              header="Fecha"
              sortable
              body={(row: CarteraItem) => formatDate(row.fechaOrden)}
            />
            <Column field="proveedorNombre" header="Proveedor" sortable />
            <Column
              field="valorTotal"
              header="Valor Total"
              sortable
              body={(row: CarteraItem) => formatCurrency(row.valorTotal)}
            />
            <Column
              field="montoPagado"
              header="Pagado"
              body={(row: CarteraItem) => formatCurrency(row.montoPagado)}
            />
            <Column
              field="saldoPendiente"
              header="Saldo Pendiente"
              sortable
              body={(row: CarteraItem) => formatCurrency(row.saldoPendiente)}
            />
            <Column
              field="rangoAntiguedad"
              header="Antigüedad"
              body={(row: CarteraItem) => (
                <Tag value={`${row.diasAntiguedad}d (${row.rangoAntiguedad})`} severity={RANGO_SEVERITY[row.rangoAntiguedad] ?? 'info'} />
              )}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Por Proveedor">
          <div className="page-header-actions">
            <Button
              label="Exportar a Excel"
              icon="pi pi-file-excel"
              outlined
              loading={isExportingProveedor}
              onClick={handleExportProveedor}
            />
          </div>
          <DataTable
            value={carteraProveedor?.data ?? []}
            loading={isLoadingProveedor}
            stripedRows
            lazy
            paginator
            first={(paramsProveedor.page - 1) * paramsProveedor.rows}
            rows={paramsProveedor.rows}
            totalRecords={carteraProveedor?.totalRecords ?? 0}
            onPage={onPageProveedor}
            onSort={onSortProveedor}
            sortField={paramsProveedor.sortField}
            sortOrder={paramsProveedor.sortOrder}
            dataKey="proveedorId"
          >
            <Column field="proveedorNombre" header="Proveedor" sortable />
            <Column field="cantidadOrdenes" header="Órdenes con Saldo" sortable bodyClassName="text-right" />
            <Column
              field="saldoPendienteTotal"
              header="Saldo Total"
              sortable
              bodyClassName="text-right"
              body={(row: CarteraProveedor) => formatCurrency(row.saldoPendienteTotal)}
            />
          </DataTable>
        </TabPanel>
      </TabView>
      </Card>
    </div>
  );
}
