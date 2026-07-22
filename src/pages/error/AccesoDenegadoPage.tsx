import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import '../../assets/styles/acceso-denegado.css';

export function AccesoDenegadoPage() {
  const navigate = useNavigate();

  return (
    <div className="acceso-denegado-page">
      <span className="pi pi-ban acceso-denegado-icon" />
      <h2 className="acceso-denegado-title">Acceso Denegado</h2>
      <p className="acceso-denegado-message">No tienes permiso para acceder a esta sección.</p>
      <Button label="Volver al Dashboard" icon="pi pi-home" onClick={() => navigate('/dashboard')} />
    </div>
  );
}
