import { Card } from 'primereact/card';

export type KpiAccent = 'primary' | 'warning' | 'danger' | 'success';
export type KpiSize = 'default' | 'compact';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  accent: KpiAccent;
  size?: KpiSize;
}

export function KpiCard({ icon, label, value, accent, size = 'default' }: KpiCardProps) {
  const sizeClass = size === 'compact' ? ' kpi-card-wrapper--compact' : '';
  return (
    <Card className={`kpi-card-wrapper kpi-accent-${accent}${sizeClass}`}>
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
