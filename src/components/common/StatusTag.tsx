import { Tag } from 'primereact/tag';

type Severity = 'success' | 'danger' | 'warning' | 'info';

const SEVERITY_MAP: Record<string, Severity> = {
  ACTIVO: 'success',
  ANULADO: 'danger',
  ANULADA: 'danger',
  PENDIENTE: 'warning',
  PARCIALMENTE_RECIBIDA: 'warning',
  RECIBIDA: 'success',
  BORRADOR: 'info',
};

interface StatusTagProps {
  status: string;
}

export function StatusTag({ status }: StatusTagProps) {
  return <Tag value={status} severity={SEVERITY_MAP[status] ?? 'info'} />;
}
