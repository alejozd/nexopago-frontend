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
  // Solo cambia lo que se muestra (guion bajo -> espacio, ej.
  // "PARCIALMENTE_RECIBIDA" -> "PARCIALMENTE RECIBIDA"): mas legible y de
  // paso permite que el texto envuelva en un contenedor angosto, ya que
  // "status" (sin espacios) se sigue usando tal cual para el severity map.
  return <Tag value={status.replace(/_/g, ' ')} severity={SEVERITY_MAP[status] ?? 'info'} />;
}
