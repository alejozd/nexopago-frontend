import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { menuConfig } from './menuConfig';

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const roles = useAuthStore((state) => state.usuario?.roles);

  const visibleItems = menuConfig.filter(
    (item) => !item.roles || item.roles.some((role) => roles?.includes(role)),
  );

  return (
    <aside className={`app-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="app-sidebar-brand">
        <span className="pi pi-bolt" />
        {!collapsed && (
          <div className="app-sidebar-brand-text">
            <span className="app-sidebar-brand-name">NexoPago</span>
            <span className="app-sidebar-brand-version">v{__APP_VERSION__}</span>
          </div>
        )}
      </div>
      <nav>
        <ul>
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `app-sidebar-link${isActive ? ' active' : ''}`}
                title={item.label}
              >
                <span className={item.icon} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
