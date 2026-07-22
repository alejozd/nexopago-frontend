import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable, type DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { useOrdenesPendientesRecepcionQuery } from '../../hooks/ordenes/useOrdenesPendientesRecepcionQuery';
import { StatusTag } from '../../components/common/StatusTag';
import { formatDate } from '../../utils/formatters';
import type { OrdenPendienteRecepcion } from '../../types/orden.types';
import '../../assets/styles/entradas.css';

const SEARCH_DEBOUNCE_MS = 400;

interface BuscarOrdenPendienteDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: (ordenId: number) => void;
}

export function BuscarOrdenPendienteDialog({ visible, onHide, onConfirm }: BuscarOrdenPendienteDialogProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenPendienteRecepcion | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput || undefined);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (visible) {
      setSearchInput('');
      setSearch(undefined);
      setOrdenSeleccionada(null);
    }
  }, [visible]);

  const { data, isLoading } = useOrdenesPendientesRecepcionQuery({ page: 1, rows: 50, search }, visible);

  const handleHide = () => {
    setOrdenSeleccionada(null);
    onHide();
  };

  const handleConfirm = () => {
    if (ordenSeleccionada) {
      onConfirm(ordenSeleccionada.id);
      handleHide();
    }
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    setOrdenSeleccionada(event.data as OrdenPendienteRecepcion);
  };

  return (
    <Dialog header="Buscar Orden Pendiente de Recepción" visible={visible} onHide={handleHide} style={{ width: '44rem' }} modal>
      <p className="buscar-orden-pendiente-subtitle">
        Órdenes de compra en borrador, pendientes o parcialmente recibidas. Selecciona una para registrar la
        entrada de mercancía.
      </p>

      <IconField iconPosition="left" style={{ marginBottom: '1rem' }}>
        <InputIcon className="pi pi-search" />
        <InputText
          placeholder="Buscar por N° de orden o proveedor..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: '100%' }}
        />
      </IconField>

      <DataTable
        value={data?.data ?? []}
        loading={isLoading}
        dataKey="id"
        size="small"
        scrollable
        scrollHeight="20rem"
        onRowClick={onRowClick}
        rowClassName={(row: OrdenPendienteRecepcion) =>
          `entradas-row-clickable${ordenSeleccionada?.id === row.id ? ' entradas-row-seleccionada' : ''}`
        }
        emptyMessage="No hay órdenes pendientes de recepción."
      >
        <Column field="numeroOrden" header="N° Orden" />
        <Column field="proveedorNombre" header="Proveedor" />
        <Column field="fechaOrden" header="Fecha" body={(row: OrdenPendienteRecepcion) => formatDate(row.fechaOrden)} />
        <Column field="estado" header="Estado" body={(row: OrdenPendienteRecepcion) => <StatusTag status={row.estado} />} />
      </DataTable>

      <div className="dialog-footer">
        <Button type="button" label="Cancelar" text onClick={handleHide} />
        <Button
          type="button"
          label="Seleccionar"
          icon="pi pi-check"
          disabled={ordenSeleccionada === null}
          onClick={handleConfirm}
        />
      </div>
    </Dialog>
  );
}
