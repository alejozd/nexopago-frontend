import { Card } from 'primereact/card';

export type KpiAccent = 'primary' | 'warning' | 'danger' | 'success';
export type KpiSize = 'default' | 'compact';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  accent: KpiAccent;
  size?: KpiSize;
  /** Resalta el valor con la tinta de sello mas oscura (--np-sello-text)
   * para destacar un unico KPI dentro de una fila, independiente de su
   * color de severidad (accent). */
  destacado?: boolean;
}

export function KpiCard({ icon, label, value, accent, size = 'default', destacado = false }: KpiCardProps) {
  const sizeClass = size === 'compact' ? ' kpi-card-wrapper--compact' : '';
  const destacadoClass = destacado ? ' kpi-card-wrapper--destacado' : '';
  return (
    <Card className={`kpi-card-wrapper kpi-accent-${accent}${sizeClass}${destacadoClass}`}>
      <div className="kpi-card">
        <span className={`kpi-icon kpi-icon-${accent}`}>
          <i className={icon} />
        </span>
        <div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-label">{label}</div>
        </div>
      </div>
    </Card>
  );
}
