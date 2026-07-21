export interface MenuItemConfig {
  label: string;
  icon: string;
  path: string;
  // Si se omite, el ítem es visible para cualquier usuario autenticado.
  roles?: string[];
}

export const menuConfig: MenuItemConfig[] = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
  { label: 'Proveedores', icon: 'pi pi-building', path: '/proveedores' },
  { label: 'Productos', icon: 'pi pi-box', path: '/productos' },
  { label: 'Órdenes de Compra', icon: 'pi pi-shopping-cart', path: '/ordenes' },
  { label: 'Entradas de Mercancía', icon: 'pi pi-truck', path: '/entradas' },
  { label: 'Recibos de Caja', icon: 'pi pi-wallet', path: '/recibos' },
  { label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios' },
  { label: 'Permisos', icon: 'pi pi-lock', path: '/permisos' },
  { label: 'Reportes de Cartera', icon: 'pi pi-chart-bar', path: '/reportes/cartera' },
  { label: 'Configuración', icon: 'pi pi-cog', path: '/configuracion/empresa' },
];
