import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { StatusTag } from '../../components/common/StatusTag';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { ReciboCaja } from '../../types/recibo.types';
import '../../assets/styles/recibos.css';

interface ReciboViewDialogProps {
  visible: boolean;
  recibo: ReciboCaja | null;
  onHide: () => void;
}

export function ReciboViewDialog({ visible, recibo, onHide }: ReciboViewDialogProps) {
  return (
    <Dialog
      header={recibo ? `Recibo ${recibo.numeroRecibo}` : 'Recibo de Caja'}
      visible={visible}
      onHide={onHide}
      style={{ width: '34rem' }}
      modal
    >
      {recibo && (
        <div className="recibo-view">
          <div className="recibo-financiero">
            <div className="recibo-financiero-item">
              <label><i className="pi pi-calendar" /> Fecha</label>
              <span>{formatDate(recibo.fechaRecibo)}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-info-circle" /> Estado</label>
              <StatusTag status={recibo.estado} />
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-file" /> Orden</label>
              <span>{recibo.numeroOrden}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-building" /> Proveedor</label>
              <span>{recibo.proveedorNombre}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-wallet" /> Valor</label>
              <span>{formatCurrency(recibo.monto)}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-tag" /> Tipo de Pago</label>
              <Tag value={recibo.tipoPago} severity={recibo.tipoPago === 'TOTAL' ? 'success' : 'info'} />
            </div>
          </div>

          <div className="recibo-view-observaciones">
            <label><i className="pi pi-comment" /> Anotaciones</label>
            <p>{recibo.observaciones || 'Sin anotaciones'}</p>
          </div>

          <div className="dialog-footer">
            <Button type="button" label="Cerrar" text onClick={onHide} />
          </div>
        </div>
      )}
    </Dialog>
  );
}
