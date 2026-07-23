import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useSessionExpiry } from '../../hooks/auth/useSessionExpiry';
import '../../assets/styles/session-expiring-dialog.css';

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Singleton global (montado una vez en App, junto a Toast/ConfirmDialog).
// No es cerrable por click afuera ni Escape: es un prompt de seguridad, el
// usuario debe elegir explícitamente una de las dos opciones.
export function SessionExpiringDialog() {
  const { showWarning, secondsLeft, isRenewing, renewError, renewSession, endSession } = useSessionExpiry();

  return (
    <Dialog
      header="Tu sesión está por expirar"
      visible={showWarning}
      onHide={() => {
        /* Intencionalmente vacío: closable/closeOnEscape/dismissableMask en false,
           así que esto nunca se dispara por interacción del usuario. */
      }}
      closable={false}
      closeOnEscape={false}
      dismissableMask={false}
      modal
      style={{ width: '26rem' }}
    >
      <p>Tu sesión está a punto de expirar por seguridad. ¿Deseas continuar trabajando?</p>
      <p className="session-expiry-countdown">
        Se cerrará en <strong>{formatCountdown(secondsLeft)}</strong>
      </p>

      {renewError && <Message severity="error" text="No se pudo renovar la sesión. Intenta de nuevo o cierra sesión." />}

      <div className="dialog-footer">
        <Button type="button" label="No, cerrar sesión" text onClick={endSession} disabled={isRenewing} />
        <Button type="button" label="Sí, mantenerme conectado" loading={isRenewing} onClick={renewSession} />
      </div>
    </Dialog>
  );
}
