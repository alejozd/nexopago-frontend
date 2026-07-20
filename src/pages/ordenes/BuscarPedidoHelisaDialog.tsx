import { useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { useHelisaPedidosQuery } from '../../hooks/helisaPedidos/useHelisaPedidosQuery';
import { useHelisaPedidoDetalleQuery } from '../../hooks/helisaPedidos/useHelisaPedidoDetalleQuery';
import type { HelisaPedidoDetalle, HelisaPedidoDetalleLinea, HelisaPedidoResumen } from '../../types/helisaPedido.types';
import '../../assets/styles/orden-form.css';

interface BuscarPedidoHelisaDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: (pedido: HelisaPedidoResumen, detalle: HelisaPedidoDetalle) => void;
  // Orden que se esta editando (si aplica). Se manda al backend para que el
  // saldo disponible de este mismo pedido excluya las lineas que la propia
  // orden ya tiene guardadas (si no, la orden se autobloquearia contando sus
  // propias lineas en contra de si misma). No se manda al crear una orden nueva.
  ordenId?: number;
}

function esLineaAgotada(linea: HelisaPedidoDetalleLinea): boolean {
  return linea.saldoDisponible <= 0;
}

export function BuscarPedidoHelisaDialog({ visible, onHide, onConfirm, ordenId }: BuscarPedidoHelisaDialogProps) {
  const [selectedPedido, setSelectedPedido] = useState<HelisaPedidoResumen | null>(null);

  const { data: pedidos, isLoading: isLoadingPedidos } = useHelisaPedidosQuery(visible);
  const { data: detalle, isLoading: isLoadingDetalle } = useHelisaPedidoDetalleQuery(
    selectedPedido?.numeroPedido ?? null,
    ordenId,
  );

  // Solo las lineas con saldo disponible pueden pasar a la orden: las
  // agotadas se siguen mostrando (para que el usuario entienda por que no
  // estan disponibles), pero quedan fuera de lo que se confirma.
  const lineasDisponibles = useMemo(
    () => detalle?.lineas.filter((linea) => !esLineaAgotada(linea)) ?? [],
    [detalle],
  );

  const handleHide = () => {
    setSelectedPedido(null);
    onHide();
  };

  const handleConfirm = () => {
    if (selectedPedido && detalle && lineasDisponibles.length > 0) {
      onConfirm(selectedPedido, { ...detalle, lineas: lineasDisponibles });
      handleHide();
    }
  };

  return (
    <Dialog
      header="Buscar Pedido ERP"
      visible={visible}
      onHide={handleHide}
      style={{ width: '52rem' }}
      modal
    >
      <p className="buscar-pedido-subtitle">
        Pedidos de compra registrados en el ERP en los últimos 60 días. Selecciona uno para ver su detalle.
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
            <>
              <DataTable
                value={detalle.lineas}
                dataKey="consecutivo"
                size="small"
                scrollable
                scrollHeight="18rem"
                rowClassName={(linea: HelisaPedidoDetalleLinea) =>
                  esLineaAgotada(linea) ? 'buscar-pedido-linea-agotada' : ''
                }
              >
                <Column field="referencia" header="Referencia" />
                <Column field="descripcion" header="Producto" />
                <Column
                  header="Saldo"
                  body={(linea: HelisaPedidoDetalleLinea) => (
                    <div className="buscar-pedido-saldo">
                      <span>
                        Pedido: {linea.cantidadPedida} · Tomado: {linea.cantidadConsumida} · Disponible:{' '}
                        {linea.saldoDisponible}
                      </span>
                      {esLineaAgotada(linea) && (
                        <Tag
                          severity="danger"
                          icon="pi pi-ban"
                          value="Agotado: sin saldo disponible en este pedido"
                          className="buscar-pedido-saldo-tag"
                        />
                      )}
                    </div>
                  )}
                />
              </DataTable>
              {lineasDisponibles.length === 0 && (
                <p className="buscar-pedido-hint buscar-pedido-hint-danger">
                  Todas las líneas de este pedido ya fueron tomadas por otras órdenes: no queda saldo disponible.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <Button type="button" label="Cancelar" text onClick={handleHide} />
        <Button
          type="button"
          label="Confirmar"
          icon="pi pi-check"
          disabled={selectedPedido === null || !detalle || lineasDisponibles.length === 0}
          onClick={handleConfirm}
        />
      </div>
    </Dialog>
  );
}
