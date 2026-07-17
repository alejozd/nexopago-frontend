import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import '../../assets/styles/layout.css';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-main">
        <Topbar />
        <main className="app-content">
          <div key={location.pathname} className="np-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
