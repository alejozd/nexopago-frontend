import { useState, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Timeline } from 'primereact/timeline';
import { confirmDialog } from 'primereact/confirmdialog';
import { useOrdenDetalleQuery } from '../../hooks/ordenes/useOrdenDetalleQuery';
import { useRecibosDeOrdenQuery } from '../../hooks/ordenes/useRecibosDeOrdenQuery';
import { useAnularOrden } from '../../hooks/ordenes/useAnularOrden';
import { StatusTag } from '../../components/common/StatusTag';
import { EntradaFormDialog } from './EntradaFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { OrdenDetalle, OrdenEstado, OrdenLinea } from '../../types/orden.types';
import type { ReciboCaja } from '../../types/recibo.types';
import '../../assets/styles/ordenes.css';

type EtapaSello = 'done' | 'active' | 'pendiente';

interface TimelineEvent {
  status: string;
  date?: string;
  icon: string;
  description: string;
  /** Estado visual del "sello" de trazabilidad: cumplida, en curso o
   * pendiente. Ver construirTimeline() para el criterio de cada etapa. */
  etapa: EtapaSello;
  /** Porcentaje mostrado en el centro del marcador cuando etapa === 'active'. */
  percent?: number;
}

// No hay tracking de cantidades recibidas en el backend, asi que el %
// recibido es una estimacion a partir del estado, no un dato exacto.
function estimarPorcentajeRecibido(estado: OrdenEstado): number {
  if (estado === 'RECIBIDA') return 100;
  if (estado === 'PARCIALMENTE_RECIBIDA') return 50;
  return 0;
}

function calcularPorcentajePagado(orden: OrdenDetalle): number {
  if (orden.valorTotal <= 0) return 0;
  return Math.min(100, Math.round((orden.montoPagado / orden.valorTotal) * 100));
}

// Criterio del "sello" de trazabilidad (marcadores done/active/pendiente):
// - Creación de la orden: siempre "done" (la orden ya existe).
// - Entrada de mercancía: se sigue mostrando solo cuando ya inicio (mismo
//   comportamiento preexistente); "done" si quedo RECIBIDA por completo,
//   "active" con el % estimado si quedo PARCIALMENTE_RECIBIDA.
// - Recibos de caja: cada recibo real ya ocurrido se marca "done" (incluso
//   si luego se anulo, el pago si se llego a registrar). Si aun no hay
//   ningun recibo, el paso queda "active" con el % pagado cuando ya hay
//   abonos parciales sin recibo formal, o "pendiente" si no se ha pagado
//   nada.
function construirTimeline(orden: OrdenDetalle, recibos: ReciboCaja[], porcentajePagado: number): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      status: 'Creación de la Orden',
      date: formatDate(orden.fechaOrden),
      icon: 'pi pi-file',
      etapa: 'done',
      description: `Orden ${orden.numeroOrden} creada para ${orden.proveedorNombre}.`,
    },
  ];

  const yaRecibida = orden.estado === 'PARCIALMENTE_RECIBIDA' || orden.estado === 'RECIBIDA';
  if (yaRecibida) {
    const esParcial = orden.estado === 'PARCIALMENTE_RECIBIDA';
    events.push({
      status: 'Entrada de Mercancía',
      icon: 'pi pi-truck',
      etapa: esParcial ? 'active' : 'done',
      percent: esParcial ? estimarPorcentajeRecibido(orden.estado) : undefined,
      description: 'Entrada de mercancía registrada.',
    });
  }

  if (recibos.length > 0) {
    recibos.forEach((recibo) => {
      events.push({
        status: `Recibo ${recibo.numeroRecibo}`,
        date: formatDate(recibo.fechaRecibo),
        icon: 'pi pi-money-bill',
        etapa: 'done',
        description: `${formatCurrency(recibo.monto)} — ${recibo.tipoPago}${
          recibo.estado === 'ANULADO' ? ' (anulado)' : ''
        }`,
      });
    });
  } else if (porcentajePagado > 0) {
    events.push({
      status: 'Recibos de Caja',
      icon: 'pi pi-money-bill',
      etapa: 'active',
      percent: porcentajePagado,
      description: 'Pagos parciales aplicados, aún sin recibo registrado.',
    });
  } else {
    events.push({
      status: 'Recibos de Caja',
      icon: 'pi pi-money-bill',
      etapa: 'pendiente',
      description: 'Aún no se han registrado recibos para esta orden.',
    });
  }

  return events;
}

const ESTADOS_CON_ENTRADA_PENDIENTE = ['BORRADOR', 'PENDIENTE', 'PARCIALMENTE_RECIBIDA'];

export function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ordenId = id ? Number(id) : undefined;

  const { data: orden, isLoading, isError } = useOrdenDetalleQuery(ordenId);
  const { data: recibos = [] } = useRecibosDeOrdenQuery(orden?.numeroOrden);
  const anularMutation = useAnularOrden();
  const [entradaDialogVisible, setEntradaDialogVisible] = useState(false);

  if (isLoading) {
    return <ProgressSpinner />;
  }

  if (isError || !orden) {
    return <p>No fue posible cargar la orden.</p>;
  }

  const porcentajeRecibido = estimarPorcentajeRecibido(orden.estado);
  const porcentajePagado = calcularPorcentajePagado(orden);
  const timelineEvents = construirTimeline(orden, recibos, porcentajePagado);

  const confirmAnular = () => {
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
    <div className="orden-detalle-page">
      <Button
        label="Volver a Órdenes"
        icon="pi pi-arrow-left"
        text
        onClick={() => navigate('/ordenes')}
      />

      <div className="orden-detalle-grid">
        <div className="orden-detalle-main">
          <Card title={`Orden ${orden.numeroOrden}`}>
            <div className="orden-header-grid">
              <div className="orden-header-field">
                <label>Proveedor</label>
                <span>{orden.proveedorNombre}</span>
              </div>
              <div className="orden-header-field">
                <label>Fecha</label>
                <span>{formatDate(orden.fechaOrden)}</span>
              </div>
              <div className="orden-header-field">
                <label>Estado</label>
                <StatusTag status={orden.estado} />
              </div>
              <div className="orden-header-field">
                <label>Valor Total</label>
                <span>{formatCurrency(orden.valorTotal)}</span>
              </div>
            </div>
            {orden.estado !== 'ANULADA' && (
              <div className="orden-header-actions">
                {(orden.estado === 'BORRADOR' || orden.estado === 'PENDIENTE') && (
                  <Button
                    label="Editar Orden"
                    icon="pi pi-pencil"
                    severity="info"
                    outlined
                    onClick={() => navigate(`/ordenes/${orden.id}/editar`)}
                  />
                )}
                {ESTADOS_CON_ENTRADA_PENDIENTE.includes(orden.estado) && (
                  <Button
                    label="Registrar Entrada"
                    icon="pi pi-truck"
                    severity="success"
                    outlined
                    onClick={() => setEntradaDialogVisible(true)}
                  />
                )}
                <Button
                  label="Anular Orden"
                  icon="pi pi-ban"
                  severity="danger"
                  outlined
                  loading={anularMutation.isPending}
                  onClick={confirmAnular}
                />
              </div>
            )}
          </Card>

          <Card title="Detalle de la Orden">
            <DataTable value={orden.detalles} stripedRows dataKey="id" size="small">
              <Column field="productoDescripcion" header="Producto" footer="Total" />
              <Column
                field="cantidad"
                header="Cantidad"
                bodyClassName="text-right"
                body={(row: OrdenLinea) => row.cantidad}
              />
              <Column
                field="precioUnitario"
                header="Precio Unitario"
                bodyClassName="text-right"
                body={(row: OrdenLinea) => formatCurrency(row.precioUnitario)}
              />
              <Column
                field="subtotal"
                header="Subtotal"
                bodyClassName="text-right orden-detalle-total-cell"
                footerClassName="text-right orden-detalle-total-cell"
                footer={formatCurrency(orden.valorTotal)}
                body={(row: OrdenLinea) => formatCurrency(row.subtotal)}
              />
            </DataTable>
          </Card>

          <Card title="Trazabilidad">
            <div className="orden-timeline-horizontal-wrap">
              <Timeline
                value={timelineEvents}
                layout="horizontal"
                align="top"
                marker={(item: TimelineEvent) => (
                  <span
                    className={`orden-timeline-marker orden-timeline-marker--${item.etapa}`}
                    style={
                      item.etapa === 'active' && item.percent != null
                        ? ({ '--tl-percent': `${item.percent}%` } as CSSProperties)
                        : undefined
                    }
                  >
                    {item.etapa === 'active' && item.percent != null ? (
                      <span className="orden-timeline-marker-percent">{item.percent}%</span>
                    ) : (
                      <i className={item.icon} />
                    )}
                  </span>
                )}
                content={(item: TimelineEvent) => (
                  <div className="orden-timeline-content">
                    <div className="orden-timeline-status">{item.status}</div>
                    {item.date && <div className="orden-timeline-date">{item.date}</div>}
                    <div className="orden-timeline-description">{item.description}</div>
                  </div>
                )}
              />
            </div>
          </Card>
        </div>

        <Card title="Progreso">
          <div className="orden-progreso-item">
            <div className="progreso-label">
              <span>% Recibido</span>
              <span>{porcentajeRecibido}%</span>
            </div>
            <ProgressBar value={porcentajeRecibido} showValue={false} />
          </div>
          <div className="orden-progreso-item">
            <div className="progreso-label">
              <span>% Pagado</span>
              <span>{porcentajePagado}%</span>
            </div>
            <ProgressBar value={porcentajePagado} showValue={false} />
          </div>
        </Card>
      </div>

      <EntradaFormDialog
        visible={entradaDialogVisible}
        ordenId={orden.id}
        onHide={() => setEntradaDialogVisible(false)}
      />
    </div>
  );
}
