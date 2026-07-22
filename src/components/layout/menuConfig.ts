export type MenuGrupoKey = 'CHIPIS' | 'FONDO' | 'PRESUPUESTO' | 'ADMINISTRACION';

export interface MenuItemConfig {
  label: string;
  icon: string;
  path: string;
  // Si se omite, el item es visible para cualquier usuario autenticado.
  requiredPermiso?: string;
  // Si se omite, el item vive suelto en el nivel superior (ej. Dashboard).
  // Se mantiene la lista plana (Topbar.resolveTitle depende de recorrerla
  // por path) y se agrega este campo en vez de anidar el array.
  grupo?: MenuGrupoKey;
}

export interface MenuGrupoConfig {
  key: MenuGrupoKey;
  label: string;
  icon: string;
}

// Mismos grupos que ya existen como MODULO en la BD (ver /permisos) -- no es
// una categoria nueva, es la misma taxonomia reflejada en la navegacion.
export const menuGrupos: MenuGrupoConfig[] = [
  { key: 'CHIPIS', label: 'Chipis', icon: 'pi pi-sitemap' },
  { key: 'FONDO', label: 'Fondo', icon: 'pi pi-money-bill' },
  { key: 'PRESUPUESTO', label: 'Presupuesto', icon: 'pi pi-chart-pie' },
  { key: 'ADMINISTRACION', label: 'Administración', icon: 'pi pi-shield' },
];

export const menuConfig: MenuItemConfig[] = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
  { label: 'Proveedores', icon: 'pi pi-building', path: '/proveedores', requiredPermiso: 'CHIPIS:PROVEEDORES_LEER', grupo: 'CHIPIS' },
  { label: 'Productos', icon: 'pi pi-box', path: '/productos', requiredPermiso: 'CHIPIS:PRODUCTOS_LEER', grupo: 'CHIPIS' },
  { label: 'Órdenes de Compra', icon: 'pi pi-shopping-cart', path: '/ordenes', requiredPermiso: 'CHIPIS:ORDENES_LEER', grupo: 'CHIPIS' },
  { label: 'Entradas de Mercancía', icon: 'pi pi-truck', path: '/entradas', requiredPermiso: 'CHIPIS:ENTRADAS_LEER', grupo: 'CHIPIS' },
  { label: 'Recibos de Caja', icon: 'pi pi-wallet', path: '/recibos', requiredPermiso: 'CHIPIS:RECIBOS_LEER', grupo: 'CHIPIS' },
  { label: 'Reportes de Cartera', icon: 'pi pi-chart-bar', path: '/reportes/cartera', requiredPermiso: 'CHIPIS:REPORTES_CARTERA_LEER', grupo: 'CHIPIS' },
  // Fondo/Presupuesto: modulos futuros sin pantalla propia todavia (ver
  // ProximamentePage). El grupo ya carga el icono+label del modulo; el
  // unico hijo hoy es el placeholder "Proximamente".
  { label: 'Próximamente', icon: 'pi pi-hourglass', path: '/fondo', requiredPermiso: 'FONDO:FONDO_LEER', grupo: 'FONDO' },
  { label: 'Próximamente', icon: 'pi pi-hourglass', path: '/presupuesto', requiredPermiso: 'PRESUPUESTO:PRESUPUESTO_LEER', grupo: 'PRESUPUESTO' },
  { label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios', requiredPermiso: 'ADMINISTRACION:USUARIOS_LEER', grupo: 'ADMINISTRACION' },
  { label: 'Permisos', icon: 'pi pi-lock', path: '/permisos', requiredPermiso: 'ADMINISTRACION:PERMISOS_LEER', grupo: 'ADMINISTRACION' },
  { label: 'Configuración', icon: 'pi pi-cog', path: '/configuracion/empresa', requiredPermiso: 'CONFIGURACION:CAMBIAR_EMPRESA', grupo: 'ADMINISTRACION' },
];
