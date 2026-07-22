import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useOrdenesPendientesPagoQuery } from '../../hooks/ordenes/useOrdenesPendientesPagoQuery';
import { useOrdenSaldoQuery } from '../../hooks/ordenes/useOrdenSaldoQuery';
import { useCreateRecibo } from '../../hooks/recibos/useCreateRecibo';
import { formatCurrency } from '../../utils/formatters';
import '../../assets/styles/recibos.css';

const reciboSchema = z.object({
  ordenId: z.number().min(1, 'La orden es obligatoria'),
  fechaRecibo: z.date({ error: 'La fecha es obligatoria' }),
  monto: z.number().min(1, 'El monto debe ser mayor a cero'),
  observaciones: z.string(),
});

type ReciboFormValues = z.infer<typeof reciboSchema>;

interface ReciboFormDialogProps {
  visible: boolean;
  onHide: () => void;
}

export function ReciboFormDialog({ visible, onHide }: ReciboFormDialogProps) {
  const { data: ordenesData } = useOrdenesPendientesPagoQuery({ page: 1, rows: 100 }, visible);
  const createMutation = useCreateRecibo();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReciboFormValues>({
    resolver: zodResolver(reciboSchema),
    defaultValues: { ordenId: 0, fechaRecibo: new Date(), monto: 0, observaciones: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ ordenId: 0, fechaRecibo: new Date(), monto: 0, observaciones: '' });
    }
  }, [visible, reset]);

  const ordenId = watch('ordenId');
  const monto = watch('monto');
  const { data: ordenDetalle } = useOrdenSaldoQuery(ordenId > 0 ? ordenId : undefined);

  const ordenesDisponibles = ordenesData?.data ?? [];
  const saldoAntes = ordenDetalle?.saldoPendiente ?? 0;
  const saldoDespues = Math.max(0, saldoAntes - (monto || 0));

  const onSubmit = (values: ReciboFormValues) => {
    createMutation.mutate(
      {
        ordenId: values.ordenId,
        fechaRecibo: dayjs(values.fechaRecibo).format('YYYY-MM-DD'),
        monto: values.monto,
        observaciones: values.observaciones.trim() || null,
      },
      { onSuccess: onHide },
    );
  };

  return (
    <Dialog header="Nuevo Recibo de Caja" visible={visible} onHide={onHide} style={{ width: '38rem' }} modal>
      <form onSubmit={handleSubmit(onSubmit)} className="recibo-form" noValidate>
        <h4 className="recibo-form-section">
          <i className="pi pi-file" /> Orden de Compra
        </h4>
        <div className="field">
          <label htmlFor="ordenId">Orden</label>
          <Controller
            name="ordenId"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="ordenId"
                value={field.value || null}
                options={ordenesDisponibles}
                optionLabel="numeroOrden"
                optionValue="id"
                filter
                placeholder="Selecciona una orden"
                itemTemplate={(orden) => `${orden.numeroOrden} — ${orden.proveedorNombre}`}
                valueTemplate={(orden) =>
                  orden ? `${orden.numeroOrden} — ${orden.proveedorNombre}` : 'Selecciona una orden'
                }
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
          {errors.ordenId && <small className="p-error">{errors.ordenId.message}</small>}
        </div>

        {ordenDetalle && (
          <div className="recibo-financiero">
            <div className="recibo-financiero-item">
              <label><i className="pi pi-tag" /> Valor Total</label>
              <span>{formatCurrency(ordenDetalle.valorTotal)}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-check-circle" /> Pagado</label>
              <span>{formatCurrency(ordenDetalle.montoPagado)}</span>
            </div>
            <div className="recibo-financiero-item">
              <label><i className="pi pi-clock" /> Saldo Antes</label>
              <span>{formatCurrency(saldoAntes)}</span>
            </div>
            <div className="recibo-financiero-item saldo-despues">
              <label><i className="pi pi-wallet" /> Saldo Después</label>
              <span>{formatCurrency(saldoDespues)}</span>
            </div>
          </div>
        )}

        <Divider />
        <h4 className="recibo-form-section">
          <i className="pi pi-credit-card" /> Detalle del Pago
        </h4>

        <div className="field-row">
          <div className="field">
            <label htmlFor="fechaRecibo">Fecha</label>
            <Controller
              name="fechaRecibo"
              control={control}
              render={({ field }) => (
                <Calendar
                  id="fechaRecibo"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value as Date)}
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              )}
            />
            {errors.fechaRecibo && <small className="p-error">{errors.fechaRecibo.message}</small>}
          </div>

          <div className="field">
            <label htmlFor="monto">Valor a Pagar</label>
            <Controller
              name="monto"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="monto"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value ?? 0)}
                  mode="currency"
                  currency="COP"
                  locale="es-CO"
                  min={0}
                  max={saldoAntes || undefined}
                />
              )}
            />
            {errors.monto && <small className="p-error">{errors.monto.message}</small>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="observaciones">Anotaciones</label>
          <InputTextarea id="observaciones" rows={2} autoResize {...register('observaciones')} />
        </div>

        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Guardar" loading={createMutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
