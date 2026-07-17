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
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/ordenes" element={<OrdenesListPage />} />
          <Route path="/ordenes/nueva" element={<OrdenFormPage />} />
          <Route path="/ordenes/:id/editar" element={<OrdenFormPage />} />
          <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
          <Route path="/recibos" element={<RecibosListPage />} />
          <Route path="/entradas" element={<EntradasListPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/permisos" element={<PermisosPage />} />
          <Route path="/reportes/cartera" element={<ReportesCarteraPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
