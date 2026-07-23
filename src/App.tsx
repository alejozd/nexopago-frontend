import { BrowserRouter } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { AppRouter } from './router/AppRouter';
import { useSessionBootstrap } from './hooks/auth/useSessionBootstrap';
import { SessionExpiringDialog } from './components/auth/SessionExpiringDialog';
import { toastRef } from './utils/toastRef';

function App() {
  useSessionBootstrap();

  return (
    <BrowserRouter>
      <Toast ref={toastRef} />
      <ConfirmDialog />
      <SessionExpiringDialog />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
