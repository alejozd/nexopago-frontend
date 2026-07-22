import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasPermiso } from '../utils/permisos';

export function PermisoRoute({ requiredPermiso }: { requiredPermiso: string }) {
  const permisos = useAuthStore((s) => s.usuario?.permisos);
  if (!hasPermiso(permisos, requiredPermiso)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return <Outlet />;
}
