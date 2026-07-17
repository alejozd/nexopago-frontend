import { Button } from 'primereact/button';

type RowActionSeverity = 'success' | 'warning' | 'danger' | 'info' | 'secondary';

export interface RowAction {
  icon: string;
  tooltip: string;
  onClick: () => void;
  severity?: RowActionSeverity;
  disabled?: boolean;
  loading?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
}

export function RowActions({ actions }: RowActionsProps) {
  return (
    <div className="row-actions">
      {actions.map((action, index) => (
        <Button
          key={index}
          icon={action.icon}
          text
          rounded
          severity={action.severity}
          disabled={action.disabled}
          loading={action.loading}
          tooltip={action.tooltip}
          tooltipOptions={{ position: 'top' }}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
}
