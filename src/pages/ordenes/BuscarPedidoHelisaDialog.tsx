import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useHelisaPedidosQuery } from '../../hooks/helisaPedidos/useHelisaPedidosQuery';
import { useHelisaPedidoDetalleQuery } from '../../hooks/helisaPedidos/useHelisaPedidoDetalleQuery';
import type { HelisaPedidoDetalle, HelisaPedidoResumen } from '../../types/helisaPedido.types';
import '../../assets/styles/orden-form.css';

interface BuscarPedidoHelisaDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: (pedido: HelisaPedidoResumen, detalle: HelisaPedidoDetalle) => void;
}

export function BuscarPedidoHelisaDialog({ visible, onHide, onConfirm }: BuscarPedidoHelisaDialogProps) {
  const [selectedPedido, setSelectedPedido] = useState<HelisaPedidoResumen | null>(null);

  const { data: pedidos, isLoading: isLoadingPedidos } = useHelisaPedidosQuery(visible);
  const { data: detalle, isLoading: isLoadingDetalle } = useHelisaPedidoDetalleQuery(
    selectedPedido?.numeroPedido ?? null,
  );

  const handleHide = () => {
    setSelectedPedido(null);
    onHide();
  };

  const handleConfirm = () => {
    if (selectedPedido && detalle) {
      onConfirm(selectedPedido, detalle);
      handleHide();
    }
  };

  return (
    <Dialog
      header="Buscar Pedido Helisa"
      visible={visible}
      onHide={handleHide}
      style={{ width: '52rem' }}
      modal
    >
      <p className="buscar-pedido-subtitle">
        Pedidos de compra registrados en Helisa en los últimos 60 días. Selecciona uno para ver su detalle.
      </p>

      <div className="buscar-pedido-grid">
        <div>
          <h5 className="buscar-pedido-section-title">Pedidos recientes</h5>
          <DataTable
            value={pedidos ?? []}
            loading={isLoadingPedidos}
            selectionMode="single"
            selection={selectedPedido}
            onSelectionChange={(e) => setSelectedPedido(e.value as HelisaPedidoResumen)}
            dataKey="numeroPedido"
            size="small"
            scrollable
            scrollHeight="18rem"
            emptyMessage="No hay pedidos registrados en los últimos 60 días."
          >
            <Column field="numeroPedido" header="N° Pedido" />
            <Column field="fecha" header="Fecha" />
          </DataTable>
        </div>

        <div>
          <h5 className="buscar-pedido-section-title">Detalle del pedido</h5>
          {selectedPedido === null && <p className="buscar-pedido-hint">Selecciona un pedido para ver sus productos.</p>}
          {selectedPedido !== null && isLoadingDetalle && <ProgressSpinner style={{ width: '2.5rem', height: '2.5rem' }} />}
          {selectedPedido !== null && !isLoadingDetalle && detalle && (
            <DataTable value={detalle.lineas} dataKey="consecutivo" size="small" scrollable scrollHeight="18rem">
              <Column field="referencia" header="Referencia" />
              <Column field="descripcion" header="Producto" />
            </DataTable>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <Button type="button" label="Cancelar" text onClick={handleHide} />
        <Button
          type="button"
          label="Confirmar"
          icon="pi pi-check"
          disabled={selectedPedido === null || !detalle}
          onClick={handleConfirm}
        />
      </div>
    </Dialog>
  );
}
