import { useState, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { useOrdenDetalleQuery } from '../../hooks/ordenes/useOrdenDetalleQuery';
import { useRecibosDeOrdenQuery } from '../../hooks/ordenes/useRecibosDeOrdenQuery';
import { useEntradasDeOrdenQuery } from '../../hooks/ordenes/useEntradasDeOrdenQuery';
import { useEstadoDocumentosOrdenQuery } from '../../hooks/ordenes/useEstadoDocumentosOrdenQuery';
import { useAnularOrden } from '../../hooks/ordenes/useAnularOrden';
import { useAuthStore } from '../../store/authStore';
import { StatusTag } from '../../components/common/StatusTag';
import { EntradaFormDialog } from './EntradaFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { hasPermiso } from '../../utils/permisos';
import type { OrdenDetalle, OrdenEstado, OrdenEstadoDocumentos, OrdenLinea } from '../../types/orden.types';
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

// Fallback SOLO para ordenes sin ningun registro real en ENTRADA_DETALLE
// (datos de antes de esta funcionalidad, ver construirTimeline): estimacion
// a partir del estado, no un dato exacto. Para todo lo demas se usa
// calcularPorcentajeRecibido(), que si es real.
function estimarPorcentajeRecibido(estado: OrdenEstado): number {
  if (estado === 'RECIBIDA') return 100;
  if (estado === 'PARCIALMENTE_RECIBIDA') return 50;
  return 0;
}

// % recibido real: suma de cantidad pedida vs. suma de cantidad ya recibida
// en todas las lineas (orden.detalles ya trae cantidad/cantidadRecibida por
// linea, ver TOrdenesService.GetByID). Reemplaza la estimacion por estado,
// EXCEPTO para ordenes viejas que ya estan RECIBIDA/PARCIALMENTE_RECIBIDA
// pero no tienen ningun registro en ENTRADA_DETALLE (datos de antes de esta
// funcionalidad): ahi se cae al mismo estimado por estado que ya usaba el
// timeline, para no mostrar 0% en una orden que el propio ESTADO dice que
// si se recibio.
function calcularPorcentajeRecibido(orden: OrdenDetalle): number {
  const totalOrdenado = orden.detalles.reduce((sum, linea) => sum + linea.cantidad, 0);
  const totalRecibido = orden.detalles.reduce((sum, linea) => sum + linea.cantidadRecibida, 0);

  if (totalRecibido <= 0 && (orden.estado === 'RECIBIDA' || orden.estado === 'PARCIALMENTE_RECIBIDA')) {
    return estimarPorcentajeRecibido(orden.estado);
  }
  if (totalOrdenado <= 0) return 0;
  return Math.min(100, Math.round((totalRecibido / totalOrdenado) * 100));
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
  puedeVerEntradas: boolean,
  puedeVerRecibos: boolean,
  estadoDocumentos: OrdenEstadoDocumentos | undefined,
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

  if (!puedeVerEntradas) {
    if (estadoDocumentos?.tieneEntradas) {
      events.push({
        status: 'Entrada de Mercancía',
        date: estadoDocumentos.fechaUltimaEntrada ? formatDate(estadoDocumentos.fechaUltimaEntrada) : undefined,
        icon: 'pi pi-truck',
        etapa: 'done',
        categoria: 'entrada',
        description:
          estadoDocumentos.cantidadEntradas > 1
            ? `${estadoDocumentos.cantidadEntradas} entradas registradas`
            : 'Entrada de mercancía registrada.',
      });
    } else {
      events.push({
        status: 'Entrada de Mercancía',
        icon: 'pi pi-clock',
        etapa: 'pendiente',
        categoria: 'entrada',
        description: 'Aún no se ha registrado ninguna entrada.',
      });
    }
  } else if (entradas.length > 0) {
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

  if (!puedeVerRecibos) {
    if (estadoDocumentos?.tieneRecibos) {
      events.push({
        status: 'Recibos de Caja',
        date: estadoDocumentos.fechaUltimoRecibo ? formatDate(estadoDocumentos.fechaUltimoRecibo) : undefined,
        icon: 'pi pi-money-bill',
        etapa: 'done',
        categoria: 'recibo',
        description:
          estadoDocumentos.cantidadRecibos > 1
            ? `${estadoDocumentos.cantidadRecibos} recibos registrados — ${formatCurrency(orden.montoPagado)} pagado`
            : `${formatCurrency(orden.montoPagado)} pagado`,
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
  } else if (recibos.length > 0) {
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

  const usuario = useAuthStore((state) => state.usuario);
  const puedeVerRecibos = hasPermiso(usuario?.permisos, 'CHIPIS:RECIBOS_LEER');
  const puedeVerEntradas = hasPermiso(usuario?.permisos, 'CHIPIS:ENTRADAS_LEER');
  const necesitaEstadoDocumentos = !puedeVerEntradas || !puedeVerRecibos;

  const { data: orden, isLoading, isError } = useOrdenDetalleQuery(ordenId);
  const { data: recibos = [] } = useRecibosDeOrdenQuery(orden?.numeroOrden, puedeVerRecibos);
  const { data: entradas = [] } = useEntradasDeOrdenQuery(orden?.id, puedeVerEntradas);
  const { data: estadoDocumentos } = useEstadoDocumentosOrdenQuery(orden?.id, necesitaEstadoDocumentos);
  const anularMutation = useAnularOrden();
  const [entradaDialogVisible, setEntradaDialogVisible] = useState(false);

  if (isLoading) {
    return <ProgressSpinner />;
  }

  if (isError || !orden) {
    return <p>No fue posible cargar la orden.</p>;
  }

  const porcentajeRecibido = calcularPorcentajeRecibido(orden);
  const porcentajePagado = calcularPorcentajePagado(orden);
  const timelineEvents = construirTimeline(
    orden,
    entradas,
    recibos,
    porcentajePagado,
    puedeVerEntradas,
    puedeVerRecibos,
    estadoDocumentos,
  );

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
          <Card>
            <div className="orden-header-top">
              <div className="orden-header-titulo">
                <h2>Orden {orden.numeroOrden}</h2>
                <p>Gestión de orden de compra y recepción de materiales.</p>
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
            </div>

            <div className="orden-header-grid">
              <div className="orden-header-field">
                <label>Proveedor</label>
                <span>{orden.proveedorNombre}</span>
              </div>
              <div className="orden-header-field">
                <label>Fecha de Emisión</label>
                <span>{formatDate(orden.fechaOrden)}</span>
              </div>
              <div className="orden-header-field">
                <label>Estado</label>
                <StatusTag status={orden.estado} />
              </div>
              <div className="orden-header-field">
                <label>Valor Total</label>
                <span className="orden-header-valor-total">{formatCurrency(orden.valorTotal)}</span>
              </div>
            </div>
          </Card>

          <Card title="Detalle de la Orden">
            <DataTable value={orden.detalles} stripedRows dataKey="id" size="small">
              <Column
                field="productoCodigoInterno"
                header="Código"
                body={(row: OrdenLinea) => row.productoCodigoInterno ?? '—'}
              />
              <Column field="productoDescripcion" header="Producto" />
              <Column
                field="cantidad"
                header="Cantidad"
                alignHeader="right"
                bodyClassName="text-right"
                body={(row: OrdenLinea) => row.cantidad}
              />
              <Column
                field="precioUnitario"
                header="Precio Unitario"
                alignHeader="right"
                bodyClassName="text-right"
                body={(row: OrdenLinea) => formatCurrency(row.precioUnitario)}
              />
              <Column
                field="subtotal"
                header="Subtotal"
                alignHeader="right"
                bodyClassName="text-right"
                body={(row: OrdenLinea) => formatCurrency(row.subtotal)}
              />
            </DataTable>

            <div className="orden-detalle-total-resumen">
              <span className="orden-detalle-total-label">Total de la orden</span>
              <span className="orden-detalle-total-valor">{formatCurrency(orden.valorTotal)}</span>
            </div>
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

        <div className="orden-sidebar-cards">
          <Card title="Progreso">
            <div className="orden-progreso-item">
              <div className="progreso-label">
                {/* Real: suma cantidad/cantidadRecibida de orden.detalles (ver
                    calcularPorcentajeRecibido). Ordenes viejas sin ningun
                    registro en ENTRADA_DETALLE caen en 0% aqui aunque su
                    ESTADO diga PARCIALMENTE_RECIBIDA/RECIBIDA -- ver el
                    fallback en construirTimeline con estimarPorcentajeRecibido. */}
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

          <Card title="Pagos">
            <div className={`orden-saldo-card orden-saldo-card--${orden.saldoPendiente > 0 ? 'pendiente' : 'saldado'}`}>
              <span className="orden-saldo-icono">
                <i className={orden.saldoPendiente > 0 ? 'pi pi-wallet' : 'pi pi-check-circle'} />
              </span>
              <div>
                <div className="orden-saldo-valor">{formatCurrency(orden.saldoPendiente)}</div>
                <div className="orden-saldo-label">
                  {orden.saldoPendiente > 0 ? 'Saldo pendiente' : 'Orden saldada'}
                </div>
              </div>
            </div>

            {!puedeVerRecibos ? (
              <p className="orden-pagos-vacio">
                {estadoDocumentos?.tieneRecibos
                  ? `Se ${estadoDocumentos.cantidadRecibos > 1 ? 'han registrado' : 'ha registrado'} ${estadoDocumentos.cantidadRecibos} recibo${estadoDocumentos.cantidadRecibos > 1 ? 's' : ''} (no tienes permiso para ver el detalle).`
                  : 'No tienes permiso para ver los recibos de esta orden.'}
              </p>
            ) : recibos.length === 0 ? (
              <p className="orden-pagos-vacio">Aún no se han registrado recibos para esta orden.</p>
            ) : (
              <ul className="orden-pagos-lista">
                {recibos.map((recibo) => (
                  <li
                    key={recibo.id}
                    className={`orden-pago-item${recibo.estado === 'ANULADO' ? ' orden-pago-item--anulado' : ''}`}
                  >
                    <i
                      className={`orden-pago-icono pi ${
                        recibo.estado === 'ANULADO' ? 'pi-times-circle' : 'pi-check-circle'
                      }`}
                    />
                    <div className="orden-pago-info">
                      <div className="orden-pago-numero">{recibo.numeroRecibo}</div>
                      <div className="orden-pago-fecha">{formatDate(recibo.fechaRecibo)}</div>
                    </div>
                    <div className="orden-pago-monto-wrap">
                      <div className="orden-pago-monto">{formatCurrency(recibo.monto)}</div>
                      <Tag value={recibo.tipoPago} severity={recibo.tipoPago === 'TOTAL' ? 'success' : 'info'} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <EntradaFormDialog
        visible={entradaDialogVisible}
        ordenId={orden.id}
        onHide={() => setEntradaDialogVisible(false)}
      />
    </div>
  );
}
