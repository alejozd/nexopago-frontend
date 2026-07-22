import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProveedoresPage } from '../pages/proveedores/ProveedoresPage';
import { ProductosPage } from '../pages/productos/ProductosPage';
import { OrdenesListPage } from '../pages/ordenes/OrdenesListPage';
import { OrdenFormPage } from '../pages/ordenes/OrdenFormPage';
import { OrdenDetallePage } from '../pages/ordenes/OrdenDetallePage';
import { RecibosListPage } from '../pages/recibos/RecibosListPage';
import { EntradasListPage } from '../pages/entradas/EntradasListPage';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { PermisosPage } from '../pages/permisos/PermisosPage';
import { ReportesCarteraPage } from '../pages/reportes/ReportesCarteraPage';
import { EmpresaActivaPage } from '../pages/empresaActiva/EmpresaActivaPage';
import { AccesoDenegadoPage } from '../pages/error/AccesoDenegadoPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PermisoRoute } from './PermisoRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reportes/cartera" element={<ReportesCarteraPage />} />
          <Route path="/sin-acceso" element={<AccesoDenegadoPage />} />

          <Route element={<PermisoRoute requiredPermiso="CHIPIS:PROVEEDORES_LEER" />}>
            <Route path="/proveedores" element={<ProveedoresPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="CHIPIS:PRODUCTOS_LEER" />}>
            <Route path="/productos" element={<ProductosPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="CHIPIS:ORDENES_LEER" />}>
            <Route path="/ordenes" element={<OrdenesListPage />} />
            <Route path="/ordenes/nueva" element={<OrdenFormPage />} />
            <Route path="/ordenes/:id/editar" element={<OrdenFormPage />} />
            <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="CHIPIS:ENTRADAS_LEER" />}>
            <Route path="/entradas" element={<EntradasListPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="CHIPIS:RECIBOS_LEER" />}>
            <Route path="/recibos" element={<RecibosListPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="ADMINISTRACION:USUARIOS_LEER" />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="ADMINISTRACION:PERMISOS_LEER" />}>
            <Route path="/permisos" element={<PermisosPage />} />
          </Route>

          <Route element={<PermisoRoute requiredPermiso="CONFIGURACION:CAMBIAR_EMPRESA" />}>
            <Route path="/configuracion/empresa" element={<EmpresaActivaPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
