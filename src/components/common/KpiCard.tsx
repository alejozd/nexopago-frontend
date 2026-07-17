import { Card } from 'primereact/card';

export type KpiAccent = 'primary' | 'warning' | 'danger' | 'success';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  accent: KpiAccent;
}

export function KpiCard({ icon, label, value, accent }: KpiCardProps) {
  return (
    <Card className={`kpi-card-wrapper kpi-accent-${accent}`}>
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
