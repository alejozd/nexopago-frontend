import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { Avatar } from 'primereact/avatar';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { menuConfig } from './menuConfig';

function resolveTitle(pathname: string): string {
  const match = menuConfig.find((item) => pathname.startsWith(item.path));
  return match?.label ?? 'NexoPago';
}

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const clearSession = useAuthStore((state) => state.clearSession);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const menuRef = useRef<Menu>(null);

  const userMenuItems: MenuItem[] = [
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        clearSession();
        navigate('/login', { replace: true });
      },
    },
  ];

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          type="button"
          className="app-topbar-toggle"
          onClick={toggleSidebar}
          aria-label="Colapsar menú"
        >
          <span className="pi pi-bars" />
        </button>
        <h1>{resolveTitle(location.pathname)}</h1>
      </div>
      <div className="app-topbar-right">
        <span className="app-topbar-user">
          {usuario ? `${usuario.nombre} ${usuario.apellido}` : ''}
        </span>
        <Avatar
          icon="pi pi-user"
          shape="circle"
          onClick={(event) => menuRef.current?.toggle(event)}
          style={{ cursor: 'pointer' }}
        />
        <Menu model={userMenuItems} popup ref={menuRef} />
      </div>
    </header>
  );
}
