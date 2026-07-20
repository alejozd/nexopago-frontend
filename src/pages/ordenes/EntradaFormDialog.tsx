import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useCreateEntrada } from '../../hooks/entradas/useCreateEntrada';

const entradaSchema = z.object({
  numeroEntradaHelisa: z.string().min(1, 'El número de entrada es obligatorio'),
  fechaEntrada: z.date({ error: 'La fecha es obligatoria' }),
  completa: z.boolean(),
  observaciones: z.string(),
});

type EntradaFormValues = z.infer<typeof entradaSchema>;

interface EntradaFormDialogProps {
  visible: boolean;
  ordenId: number | null;
  onHide: () => void;
}

export function EntradaFormDialog({ visible, ordenId, onHide }: EntradaFormDialogProps) {
  const createMutation = useCreateEntrada();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntradaFormValues>({
    resolver: zodResolver(entradaSchema),
    defaultValues: { numeroEntradaHelisa: '', fechaEntrada: new Date(), completa: true, observaciones: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ numeroEntradaHelisa: '', fechaEntrada: new Date(), completa: true, observaciones: '' });
    }
  }, [visible, reset]);

  const onSubmit = (values: EntradaFormValues) => {
    if (ordenId === null) return;
    createMutation.mutate(
      {
        ordenId,
        numeroEntradaHelisa: values.numeroEntradaHelisa.trim(),
        fechaEntrada: dayjs(values.fechaEntrada).format('YYYY-MM-DD'),
        completa: values.completa,
        observaciones: values.observaciones.trim() || null,
      },
      { onSuccess: onHide },
    );
  };

  return (
    <Dialog header="Registrar Entrada de Mercancía" visible={visible} onHide={onHide} style={{ width: '26rem' }} modal>
      <form onSubmit={handleSubmit(onSubmit)} className="recibo-form" noValidate>
        <div className="field">
          <label htmlFor="numeroEntradaHelisa">Número de Entrada ERP</label>
          <InputText id="numeroEntradaHelisa" autoFocus placeholder="INGR0001" {...register('numeroEntradaHelisa')} />
          {errors.numeroEntradaHelisa && <small className="p-error">{errors.numeroEntradaHelisa.message}</small>}
        </div>

        <div className="field">
          <label htmlFor="fechaEntrada">Fecha</label>
          <Controller
            name="fechaEntrada"
            control={control}
            render={({ field }) => (
              <Calendar
                id="fechaEntrada"
                value={field.value}
                onChange={(e) => field.onChange(e.value as Date)}
                dateFormat="dd/mm/yy"
                showIcon
              />
            )}
          />
          {errors.fechaEntrada && <small className="p-error">{errors.fechaEntrada.message}</small>}
        </div>

        <div className="field">
          <Controller
            name="completa"
            control={control}
            render={({ field }) => (
              <div className="p-field-checkbox">
                <Checkbox inputId="completa" checked={field.value} onChange={(e) => field.onChange(e.checked)} />
                <label htmlFor="completa" style={{ marginLeft: '0.5rem' }}>
                  Recepción completa
                </label>
              </div>
            )}
          />
        </div>

        <div className="field">
          <label htmlFor="observaciones">Observaciones</label>
          <InputTextarea id="observaciones" rows={2} {...register('observaciones')} />
        </div>

        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Registrar" loading={createMutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
