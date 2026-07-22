export function hasPermiso(permisos: string[] | undefined, requerido?: string): boolean {
  if (!requerido) return true;
  return permisos?.includes(requerido) ?? false;
}
