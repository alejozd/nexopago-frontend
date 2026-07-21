import { Card } from 'primereact/card';

export type KpiAccent = 'primary' | 'warning' | 'danger' | 'success';
export type KpiSize = 'default' | 'compact';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  accent: KpiAccent;
  size?: KpiSize;
  /** Resalta el valor con la tinta de sello mas oscura (--np-sello-text) y
   * un fondo degradado tenue (segun accent), para destacar un unico KPI
   * dentro de una fila, independiente de su color de severidad (accent). */
  destacado?: boolean;
  /** Linea de contexto opcional debajo de la etiqueta, solo con datos reales
   * ya disponibles (ej. "Repartido en 5 ordenes pendientes"), nunca una
   * tendencia inventada sin historico que la respalde. */
  subtitulo?: string;
  /** Para valores que pueden ser texto largo (nombre de proveedor, numero de
   * orden) en vez de una cifra corta: reduce la fuente y permite hasta 2
   * renglones (con ellipsis como ultimo recurso) en lugar de truncar a una
   * sola linea. Aplicar a las 4 tarjetas de la fila por igual para que
   * todas reserven la misma altura, incluso las que sí caben en 1 linea. */
  wrapValue?: boolean;
}

export function KpiCard({
  icon,
  label,
  value,
  accent,
  size = 'default',
  destacado = false,
  subtitulo,
  wrapValue = false,
}: KpiCardProps) {
  const sizeClass = size === 'compact' ? ' kpi-card-wrapper--compact' : '';
  const destacadoClass = destacado ? ' kpi-card-wrapper--destacado' : '';
  const wrapClass = wrapValue ? ' kpi-card-wrapper--wrap-value' : '';
  return (
    <Card className={`kpi-card-wrapper kpi-accent-${accent}${sizeClass}${destacadoClass}${wrapClass}`}>
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">{label}</span>
          <span className={`kpi-icon kpi-icon-${accent}`}>
            <i className={icon} />
          </span>
        </div>
        <div className="kpi-value" title={value}>{value}</div>
        {subtitulo && (
          <>
            <hr className="kpi-divider" />
            <div className="kpi-subtitulo">{subtitulo}</div>
          </>
        )}
      </div>
    </Card>
  );
}
