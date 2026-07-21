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
import { useEntradasDeOrdenQuery } from '../../hooks/ordenes/useEntradasDeOrdenQuery';
import { useAnularOrden } from '../../hooks/ordenes/useAnularOrden';
import { StatusTag } from '../../components/common/StatusTag';
import { EntradaFormDialog } from './EntradaFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { OrdenDetalle, OrdenEstado, OrdenLinea } from '../../types/orden.types';
import type { ReciboCaja } from '../../types/recibo.types';
import type { EntradaMercancia } from '../../types/entrada.types';
import '../../assets/styles/ordenes.css';

type EtapaSello = 'done' | 'active' | 'pendiente';
type CategoriaTrazabilidad = 'creacion' | 'entrada' | 'recibo';

interface TimelineEvent {
  /** 1ra linea: nombre de la etapa. */
  status: string;
  /** 2da linea. Solo se omite en los estados sintéticos que aun no tienen un
   * documento real detras (recibo "active"/"pendiente" antes del primer
   * abono). */
  date?: string;
  icon: string;
  /** 3ra linea: el "valor" del documento de esa etapa (moneda para
   * Creación/Recibo, numero de documento ERP para Entrada). */
  description: string;
  /** 4ta linea opcional, unico caso hoy: proveedor en "Creación de la Orden"
   * (a peticion explicita del usuario, aunque ya se ve en la cabecera de la
   * pagina). */
  detalle?: string;
  /** Estado visual del "sello" de trazabilidad: cumplida, en curso o
   * pendiente. Ver construirTimeline() para el criterio de cada etapa. */
  etapa: EtapaSello;
  /** A que tipo de hito pertenece (creacion/entrada/recibo): define el color
   * del marcador (ver COLOR_POR_CATEGORIA). El estado (etapa) sigue
   * comunicandose con la forma del marcador (solido/anillo/hueco), no con
   * el color. */
  categoria: CategoriaTrazabilidad;
  /** Porcentaje mostrado en el centro del marcador cuando etapa === 'active'. */
  percent?: number;
}

// Un color por categoria (no por etapa) para que Creacion/Entrada/Recibo se
// distingan a simple vista, ademas del icono. Reutiliza tokens semanticos ya
// aprobados en design-system.css (ninguno nuevo): --np-sello sigue siendo el
// acento de marca (Creacion, el origen del hito), --np-success ya es el
// verde de "completado" en el resto de la app (Recibo = dinero recibido).
// Entrada usa --np-neutral (azul-grisaceo) en vez de --np-teal: teal y
// success son ambos verdes y se confundian entre si (--np-neutral no se usa
// en ningun otro lado de la app todavia). "pendiente" se mantiene neutro a
// proposito (nada ha pasado todavia, sin importar la categoria).
const COLOR_POR_CATEGORIA: Record<CategoriaTrazabilidad, { color: string; colorTexto: string }> = {
  creacion: { color: 'var(--np-sello)', colorTexto: 'var(--np-sello-text)' },
  entrada: { color: 'var(--np-neutral)', colorTexto: 'var(--np-neutral)' },
  recibo: { color: 'var(--np-success)', colorTexto: 'var(--np-success)' },
};

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
// - Entrada de mercancía: cada entrada real ya registrada se marca "done"
//   (puede haber mas de una por entregas parciales, ver
//   useEntradasDeOrdenQuery). Se muestran todas, independiente del estado
//   ACTUAL de la orden (una entrada ya ocurrida no deja de ser un hecho
//   historico aunque la orden luego se anule). Si NO hay ninguna entrada
//   real pero el estado de la orden ya indica que se recibio algo (datos
//   inconsistentes de ordenes anteriores a la auditoria de entradas), se usa
//   el mismo placeholder estimado que antes.
// - Recibos de caja: cada recibo real ya ocurrido se marca "done" (incluso
//   si luego se anulo, el pago si se llego a registrar). Si aun no hay
//   ningun recibo, el paso queda "active" con el % pagado cuando ya hay
//   abonos parciales sin recibo formal, o "pendiente" si no se ha pagado
//   nada.
//
// Contenido uniforme titulo/fecha/valor (3 lineas) para las etapas que
// tienen un documento real detras; los estados sinteticos "active"/
// "pendiente" de Recibos de Caja (sin recibo real todavia) siguen con una
// sola linea descriptiva, porque no hay fecha ni documento que mostrar.
function construirTimeline(
  orden: OrdenDetalle,
  entradas: EntradaMercancia[],
  recibos: ReciboCaja[],
  porcentajePagado: number,
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      status: 'Creación de la Orden',
      date: formatDate(orden.fechaOrden),
      icon: 'pi pi-file',
      etapa: 'done',
      categoria: 'creacion',
      description: formatCurrency(orden.valorTotal),
      detalle: orden.proveedorNombre,
    },
  ];

  if (entradas.length > 0) {
    entradas.forEach((entrada) => {
      events.push({
        status: 'Entrada de Mercancía',
        date: formatDate(entrada.fechaEntrada),
        icon: 'pi pi-truck',
        etapa: 'done',
        categoria: 'entrada',
        description: `N.º ${entrada.numeroEntradaHelisa}`,
      });
    });
  } else if (orden.estado === 'PARCIALMENTE_RECIBIDA' || orden.estado === 'RECIBIDA') {
    const esParcial = orden.estado === 'PARCIALMENTE_RECIBIDA';
    events.push({
      status: 'Entrada de Mercancía',
      icon: 'pi pi-truck',
      etapa: esParcial ? 'active' : 'done',
      categoria: 'entrada',
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
        categoria: 'recibo',
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
      categoria: 'recibo',
      percent: porcentajePagado,
      description: 'Pagos parciales aplicados, aún sin recibo registrado.',
    });
  } else {
    events.push({
      status: 'Recibos de Caja',
      icon: 'pi pi-money-bill',
      etapa: 'pendiente',
      categoria: 'recibo',
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
  const { data: entradas = [] } = useEntradasDeOrdenQuery(orden?.id);
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
  const timelineEvents = construirTimeline(orden, entradas, recibos, porcentajePagado);

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
                      {
                        '--tl-color': COLOR_POR_CATEGORIA[item.categoria].color,
                        '--tl-color-text': COLOR_POR_CATEGORIA[item.categoria].colorTexto,
                        ...(item.etapa === 'active' && item.percent != null
                          ? { '--tl-percent': `${item.percent}%` }
                          : {}),
                      } as CSSProperties
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
                    {item.detalle && <div className="orden-timeline-detalle">{item.detalle}</div>}
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
