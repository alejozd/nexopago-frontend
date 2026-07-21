import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useOrdenDetalleQuery } from '../../hooks/ordenes/useOrdenDetalleQuery';
import { useCreateEntrada } from '../../hooks/entradas/useCreateEntrada';
import type { EntradaLineaCreateDTO } from '../../types/entrada.types';
import '../../assets/styles/ordenes.css';

const entradaSchema = z.object({
  numeroEntradaHelisa: z.string().min(1, 'El número de entrada es obligatorio'),
  fechaEntrada: z.date({ error: 'La fecha es obligatoria' }),
  observaciones: z.string(),
});

type EntradaFormValues = z.infer<typeof entradaSchema>;

// Cantidad a recibir para una linea de la orden en esta entrada. cantidad
// arranca en 0 (no autocompleta el saldo pendiente por defecto: el checkbox
// "Recepción completa" es el atajo explicito para eso).
interface LineaEntradaForm {
  ordenDetalleId: number;
  productoDescripcion: string;
  productoCodigoInterno: string | null;
  saldoPendiente: number;
  cantidad: number;
}

interface EntradaFormDialogProps {
  visible: boolean;
  ordenId: number | null;
  onHide: () => void;
}

export function EntradaFormDialog({ visible, ordenId, onHide }: EntradaFormDialogProps) {
  const { data: orden, isLoading: isLoadingOrden } = useOrdenDetalleQuery(visible ? (ordenId ?? undefined) : undefined);
  const createMutation = useCreateEntrada();

  const [lineas, setLineas] = useState<LineaEntradaForm[]>([]);
  const [recepcionCompleta, setRecepcionCompleta] = useState(false);
  const [lineasError, setLineasError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntradaFormValues>({
    resolver: zodResolver(entradaSchema),
    defaultValues: { numeroEntradaHelisa: '', fechaEntrada: new Date(), observaciones: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ numeroEntradaHelisa: '', fechaEntrada: new Date(), observaciones: '' });
      setRecepcionCompleta(false);
      setLineasError(null);
    }
  }, [visible, reset]);

  // Las lineas del formulario se arman cuando llega el detalle de la orden;
  // se muestran TODAS (incluidas las ya completadas, deshabilitadas) para
  // que se entienda el avance real de la orden, mismo criterio que
  // BuscarPedidoHelisaDialog con las lineas agotadas.
  useEffect(() => {
    if (visible && orden) {
      setLineas(
        orden.detalles.map((linea) => ({
          ordenDetalleId: linea.id,
          productoDescripcion: linea.productoDescripcion,
          productoCodigoInterno: linea.productoCodigoInterno,
          saldoPendiente: linea.saldoPendiente,
          cantidad: 0,
        })),
      );
    }
  }, [visible, orden]);

  const actualizarCantidad = (ordenDetalleId: number, cantidad: number) => {
    setLineas((prev) => prev.map((l) => (l.ordenDetalleId === ordenDetalleId ? { ...l, cantidad } : l)));
    setLineasError(null);
  };

  const toggleRecepcionCompleta = (checked: boolean) => {
    setRecepcionCompleta(checked);
    setLineas((prev) => prev.map((l) => ({ ...l, cantidad: checked ? l.saldoPendiente : 0 })));
    setLineasError(null);
  };

  const onSubmit = (values: EntradaFormValues) => {
    if (ordenId === null) return;

    const detalles: EntradaLineaCreateDTO[] = lineas
      .filter((l) => l.cantidad > 0)
      .map((l) => ({ ordenDetalleId: l.ordenDetalleId, cantidadRecibida: l.cantidad }));

    if (detalles.length === 0) {
      setLineasError('Indica la cantidad recibida de al menos un producto.');
      return;
    }
    if (lineas.some((l) => l.cantidad > l.saldoPendiente)) {
      setLineasError('Hay una cantidad recibida que supera el saldo pendiente de esa línea.');
      return;
    }
    setLineasError(null);

    createMutation.mutate(
      {
        ordenId,
        numeroEntradaHelisa: values.numeroEntradaHelisa.trim(),
        fechaEntrada: dayjs(values.fechaEntrada).format('YYYY-MM-DD'),
        observaciones: values.observaciones.trim() || null,
        detalles,
      },
      { onSuccess: onHide },
    );
  };

  return (
    <Dialog header="Registrar Entrada de Mercancía" visible={visible} onHide={onHide} style={{ width: '34rem' }} modal>
      {isLoadingOrden ? (
        <ProgressSpinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="recibo-form" noValidate>
          <div className="entrada-form-header-row">
            <div className="field entrada-form-numero-field">
              <label htmlFor="numeroEntradaHelisa">Número de Entrada ERP</label>
              <InputText id="numeroEntradaHelisa" autoFocus placeholder="INGR0001" {...register('numeroEntradaHelisa')} />
              {errors.numeroEntradaHelisa && <small className="p-error">{errors.numeroEntradaHelisa.message}</small>}
            </div>
            {orden && (
              <div className="entrada-form-orden-contexto">
                <span className="entrada-form-orden-label">Orden</span>
                <span className="entrada-form-orden-valor">{orden.numeroOrden}</span>
              </div>
            )}
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
            <div className="p-field-checkbox">
              <Checkbox
                inputId="completa"
                checked={recepcionCompleta}
                onChange={(e) => toggleRecepcionCompleta(!!e.checked)}
              />
              <label htmlFor="completa" style={{ marginLeft: '0.5rem' }}>
                Recepción completa
              </label>
            </div>
            <small className="entrada-form-hint">
              Autocompleta la cantidad recibida de cada producto con su saldo pendiente.
            </small>
          </div>

          <div className="field">
            <label>Productos de la orden</label>
            <ul className="entrada-form-lineas">
              {lineas.map((linea) => {
                const completada = linea.saldoPendiente <= 0;
                return (
                  <li key={linea.ordenDetalleId} className={`entrada-form-linea${completada ? ' entrada-form-linea--completada' : ''}`}>
                    <div className="entrada-form-linea-info">
                      <span className="entrada-form-linea-nombre" title={linea.productoDescripcion}>
                        {linea.productoDescripcion}
                      </span>
                      <span className="entrada-form-linea-detalle">
                        {linea.productoCodigoInterno && (
                          <span className="entrada-form-linea-codigo">Cód. {linea.productoCodigoInterno}</span>
                        )}
                        <span className="entrada-form-linea-saldo">
                          {completada ? 'Recepción completa' : `Saldo pendiente: ${linea.saldoPendiente}`}
                        </span>
                      </span>
                    </div>
                    <InputNumber
                      className="entrada-form-linea-cantidad"
                      value={linea.cantidad}
                      onValueChange={(e) => actualizarCantidad(linea.ordenDetalleId, e.value ?? 0)}
                      min={0}
                      max={linea.saldoPendiente}
                      mode="decimal"
                      minFractionDigits={0}
                      disabled={completada}
                    />
                  </li>
                );
              })}
            </ul>
            {lineasError && <small className="p-error">{lineasError}</small>}
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
      )}
    </Dialog>
  );
}
