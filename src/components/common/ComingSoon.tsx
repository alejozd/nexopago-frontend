import { Card } from 'primereact/card';

interface ComingSoonProps {
  title: string;
}

// Placeholder para modulos que se implementan en iteraciones siguientes
// (paso 7 del plan), replicando el patron types -> service -> hook -> page
// que ya se establecio con el modulo Proveedores.
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <Card title={title}>
      <p>Este módulo se implementará en una próxima iteración.</p>
    </Card>
  );
}
