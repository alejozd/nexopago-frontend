export interface MenuItemConfig {
  label: string;
  icon: string;
  path: string;
  // Si se omite, el ítem es visible para cualquier usuario autenticado.
  requiredPermiso?: string;
}

export const menuConfig: MenuItemConfig[] = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
  { label: 'Proveedores', icon: 'pi pi-building', path: '/proveedores', requiredPermiso: 'CHIPIS:PROVEEDORES_LEER' },
  { label: 'Productos', icon: 'pi pi-box', path: '/productos', requiredPermiso: 'CHIPIS:PRODUCTOS_LEER' },
  { label: 'Órdenes de Compra', icon: 'pi pi-shopping-cart', path: '/ordenes', requiredPermiso: 'CHIPIS:ORDENES_LEER' },
  { label: 'Entradas de Mercancía', icon: 'pi pi-truck', path: '/entradas', requiredPermiso: 'CHIPIS:ENTRADAS_LEER' },
  { label: 'Recibos de Caja', icon: 'pi pi-wallet', path: '/recibos', requiredPermiso: 'CHIPIS:RECIBOS_LEER' },
  { label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios', requiredPermiso: 'ADMINISTRACION:USUARIOS_LEER' },
  { label: 'Permisos', icon: 'pi pi-lock', path: '/permisos', requiredPermiso: 'ADMINISTRACION:PERMISOS_LEER' },
  { label: 'Reportes de Cartera', icon: 'pi pi-chart-bar', path: '/reportes/cartera' },
  { label: 'Configuración', icon: 'pi pi-cog', path: '/configuracion/empresa', requiredPermiso: 'CONFIGURACION:CAMBIAR_EMPRESA' },
];
