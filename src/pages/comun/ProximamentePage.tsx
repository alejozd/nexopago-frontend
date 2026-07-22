import '../../assets/styles/proximamente.css';

interface ProximamentePageProps {
  titulo: string;
  icono: string;
  descripcion?: string;
}

export function ProximamentePage({ titulo, icono, descripcion }: ProximamentePageProps) {
  return (
    <div className="proximamente-page">
      <span className={`${icono} proximamente-icon`} />
      <h2 className="proximamente-title">{titulo}</h2>
      <p className="proximamente-message">
        {descripcion ?? 'Esta sección está en preparación. Pronto vas a poder usarla desde aquí.'}
      </p>
    </div>
  );
}
