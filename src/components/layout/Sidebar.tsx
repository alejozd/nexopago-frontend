import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { hasPermiso } from '../../utils/permisos';
import { menuConfig, menuGrupos, type MenuGrupoKey } from './menuConfig';

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const permisos = useAuthStore((state) => state.usuario?.permisos);
  const location = useLocation();

  const visibleItems = useMemo(
    () => menuConfig.filter((item) => hasPermiso(permisos, item.requiredPermiso)),
    [permisos],
  );

  const itemsSueltos = visibleItems.filter((item) => !item.grupo);

  const grupos = useMemo(
    () =>
      menuGrupos
        .map((grupo) => ({ ...grupo, items: visibleItems.filter((item) => item.grupo === grupo.key) }))
        .filter((grupo) => grupo.items.length > 0),
    [visibleItems],
  );

  const grupoActivo = grupos.find((grupo) => grupo.items.some((item) => location.pathname.startsWith(item.path)))?.key;

  // Arranca abierto el grupo de la ruta actual; si no hay ninguno activo
  // (ej. estamos en Dashboard), abre el primero que el usuario pueda ver.
  const [expandidos, setExpandidos] = useState<Set<MenuGrupoKey>>(() => {
    const inicial = new Set<MenuGrupoKey>();
    if (grupoActivo) inicial.add(grupoActivo);
    else if (grupos[0]) inicial.add(grupos[0].key);
    return inicial;
  });

  useEffect(() => {
    if (grupoActivo) {
      setExpandidos((prev) => (prev.has(grupoActivo) ? prev : new Set(prev).add(grupoActivo)));
    }
  }, [grupoActivo]);

  const toggleGrupo = (key: MenuGrupoKey) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
          {itemsSueltos.map((item) => (
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

          {grupos.map((grupo) => (
            <li key={grupo.key} className="app-sidebar-grupo">
              <button
                type="button"
                className="app-sidebar-grupo-header"
                onClick={() => !collapsed && toggleGrupo(grupo.key)}
                aria-expanded={collapsed ? undefined : expandidos.has(grupo.key)}
                title={grupo.label}
              >
                <span className="app-sidebar-grupo-left">
                  <span className={grupo.icon} />
                  {!collapsed && <span>{grupo.label}</span>}
                </span>
                {!collapsed && (
                  <span
                    className={`pi pi-angle-right app-sidebar-grupo-chevron${expandidos.has(grupo.key) ? ' expanded' : ''}`}
                  />
                )}
              </button>

              <ul
                className={`app-sidebar-grupo-body${!collapsed && !expandidos.has(grupo.key) ? ' collapsed-body' : ''}`}
              >
                {grupo.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `app-sidebar-link app-sidebar-sublink${isActive ? ' active' : ''}`}
                      title={item.label}
                    >
                      <span className={item.icon} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
