import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column, type ColumnBodyOptions } from 'primereact/column';
import { AutoComplete, type AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useProveedoresQuery } from '../../hooks/proveedores/useProveedoresQuery';
import { useProductosQuery } from '../../hooks/productos/useProductosQuery';
import { useCreateOrden } from '../../hooks/ordenes/useCreateOrden';
import { useUpdateOrden } from '../../hooks/ordenes/useUpdateOrden';
import { useOrdenDetalleQuery } from '../../hooks/ordenes/useOrdenDetalleQuery';
import { formatCurrency } from '../../utils/formatters';
import type { Producto } from '../../types/producto.types';
import type { OrdenLineaCreateDTO } from '../../types/orden.types';
import '../../assets/styles/orden-form.css';

const headerSchema = z.object({
  proveedorId: z.number({ error: 'El proveedor es obligatorio' }).min(1, 'El proveedor es obligatorio'),
  fechaOrden: z.date({ error: 'La fecha es obligatoria' }),
  numeroPedidoHelisa: z.string(),
  observaciones: z.string(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface LineaForm {
  producto: Producto | null;
  cantidad: number;
  precioUnitario: number;
}

function crearLineaVacia(): LineaForm {
  return { producto: null, cantidad: 1, precioUnitario: 0 };
}

// La orden trae productoId/productoDescripcion, no el Producto completo:
// se arma un objeto suficiente para que AutoComplete lo muestre (solo usa
// `id` para el submit y `descripcion` para el texto visible).
function productoDesdeLinea(productoId: number, descripcion: string): Producto {
  return {
    id: productoId,
    codigoHelisa: '',
    subCodigoHelisa: '',
    codigoInterno: null,
    descripcion,
    unidadMedida: null,
    precioReferencia: null,
    activo: true,
  };
}

export function OrdenFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;
  const ordenId = isEditMode ? Number(id) : undefined;

  const { data: orden, isLoading: isLoadingOrden } = useOrdenDetalleQuery(ordenId);
  const { data: proveedoresData } = useProveedoresQuery({ page: 1, rows: 100 });
  const { data: productosData } = useProductosQuery({ page: 1, rows: 100 });
  const createMutation = useCreateOrden();
  const updateMutation = useUpdateOrden();
  const mutation = isEditMode ? updateMutation : createMutation;

  const [lineas, setLineas] = useState<LineaForm[]>([crearLineaVacia()]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [lineasError, setLineasError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      proveedorId: 0,
      fechaOrden: new Date(),
      numeroPedidoHelisa: '',
      observaciones: '',
    },
  });

  useEffect(() => {
    if (isEditMode && orden) {
      reset({
        proveedorId: orden.proveedorId,
        fechaOrden: dayjs(orden.fechaOrden).toDate(),
        numeroPedidoHelisa: orden.numeroPedidoHelisa ?? '',
        observaciones: orden.observaciones ?? '',
      });
      setLineas(
        orden.detalles.map((linea) => ({
          producto: productoDesdeLinea(linea.productoId, linea.productoDescripcion),
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
        })),
      );
    }
  }, [isEditMode, orden, reset]);

  const proveedorOptions = proveedoresData?.data ?? [];
  const productos = productosData?.data ?? [];

  const searchProductos = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase();
    setFilteredProductos(productos.filter((p) => p.descripcion.toLowerCase().includes(query)));
  };

  const updateLinea = (index: number, patch: Partial<LineaForm>) => {
    setLineas((prev) => prev.map((linea, i) => (i === index ? { ...linea, ...patch } : linea)));
  };

  const addLinea = () => setLineas((prev) => [...prev, crearLineaVacia()]);

  const removeLinea = (index: number) => setLineas((prev) => prev.filter((_, i) => i !== index));

  const totalOrden = lineas.reduce((sum, linea) => sum + linea.cantidad * linea.precioUnitario, 0);

  if (isEditMode && isLoadingOrden) {
    return <ProgressSpinner />;
  }

  if (isEditMode && orden && orden.estado !== 'BORRADOR' && orden.estado !== 'PENDIENTE') {
    return (
      <Card title="No se puede editar">
        <p>Esta orden está en estado {orden.estado} y solo se pueden editar órdenes BORRADOR o PENDIENTE.</p>
        <Button label="Volver al detalle" icon="pi pi-arrow-left" text onClick={() => navigate(`/ordenes/${orden.id}`)} />
      </Card>
    );
  }

  const onSubmit = (values: HeaderFormValues) => {
    const detalles: OrdenLineaCreateDTO[] = lineas
      .filter((linea) => linea.producto !== null)
      .map((linea) => ({
        productoId: linea.producto!.id,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
      }));

    if (detalles.length === 0) {
      setLineasError('Agrega al menos una línea con un producto seleccionado.');
      return;
    }
    setLineasError(null);

    const dto = {
      proveedorId: values.proveedorId,
      fechaOrden: dayjs(values.fechaOrden).format('YYYY-MM-DD'),
      numeroPedidoHelisa: values.numeroPedidoHelisa.trim() || null,
      fechaPedidoHelisa: null,
      totalPedidoHelisa: null,
      observaciones: values.observaciones.trim() || null,
      detalles,
    };

    if (isEditMode && ordenId !== undefined) {
      updateMutation.mutate({ id: ordenId, dto }, { onSuccess: () => navigate(`/ordenes/${ordenId}`) });
    } else {
      createMutation.mutate(dto, { onSuccess: ({ id: newId }) => navigate(`/ordenes/${newId}`) });
    }
  };

  return (
    <div className="orden-form-page">
      <Button
        label={isEditMode ? 'Volver al Detalle' : 'Volver a Órdenes'}
        icon="pi pi-arrow-left"
        text
        onClick={() => navigate(isEditMode ? `/ordenes/${ordenId}` : '/ordenes')}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card title={isEditMode ? `Editar Orden ${orden?.numeroOrden ?? ''}` : 'Nueva Orden de Compra'}>
          <div className="orden-form-header-grid">
            <div className="field">
              <label htmlFor="proveedorId">Proveedor</label>
              <Controller
                name="proveedorId"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="proveedorId"
                    value={field.value || null}
                    options={proveedorOptions}
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Selecciona un proveedor"
                    filter
                    onChange={(e) => field.onChange(e.value)}
                  />
                )}
              />
              {errors.proveedorId && <small className="p-error">{errors.proveedorId.message}</small>}
            </div>
            <div className="field">
              <label htmlFor="fechaOrden">Fecha</label>
              <Controller
                name="fechaOrden"
                control={control}
                render={({ field }) => (
                  <Calendar
                    id="fechaOrden"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    showIcon
                  />
                )}
              />
              {errors.fechaOrden && <small className="p-error">{errors.fechaOrden.message}</small>}
            </div>
            <div className="field">
              <label htmlFor="numeroPedidoHelisa">N° Pedido Helisa (opcional)</label>
              <InputText id="numeroPedidoHelisa" {...register('numeroPedidoHelisa')} />
            </div>
          </div>

          <div className="orden-form-observaciones">
            <div className="field">
              <label htmlFor="observaciones">Observaciones</label>
              <InputTextarea id="observaciones" rows={2} {...register('observaciones')} />
            </div>
          </div>
        </Card>

        <Card title="Líneas de Detalle" style={{ marginTop: '1.5rem' }}>
          <DataTable value={lineas} dataKey={undefined} size="small">
            <Column
              header="Producto"
              body={(row: LineaForm, options: ColumnBodyOptions) => (
                <AutoComplete
                  value={row.producto}
                  suggestions={filteredProductos}
                  completeMethod={searchProductos}
                  field="descripcion"
                  placeholder="Buscar producto..."
                  onChange={(e) => {
                    const value = e.value as Producto | string;
                    if (typeof value !== 'string') {
                      updateLinea(options.rowIndex, {
                        producto: value,
                        precioUnitario: value.precioReferencia ?? row.precioUnitario,
                      });
                    }
                  }}
                />
              )}
            />
            <Column
              header="Cantidad"
              body={(row: LineaForm, options: ColumnBodyOptions) => (
                <InputNumber
                  value={row.cantidad}
                  onValueChange={(e) => updateLinea(options.rowIndex, { cantidad: e.value ?? 0 })}
                  min={0}
                  mode="decimal"
                  minFractionDigits={0}
                />
              )}
            />
            <Column
              header="Precio Unitario"
              body={(row: LineaForm, options: ColumnBodyOptions) => (
                <InputNumber
                  value={row.precioUnitario}
                  onValueChange={(e) => updateLinea(options.rowIndex, { precioUnitario: e.value ?? 0 })}
                  min={0}
                  mode="currency"
                  currency="COP"
                  locale="es-CO"
                />
              )}
            />
            <Column
              header="Subtotal"
              bodyClassName="text-right"
              body={(row: LineaForm) => formatCurrency(row.cantidad * row.precioUnitario)}
            />
            <Column
              header=""
              body={(_row: LineaForm, options: ColumnBodyOptions) => (
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  disabled={lineas.length === 1}
                  onClick={() => removeLinea(options.rowIndex)}
                />
              )}
            />
          </DataTable>

          <div className="orden-form-lineas-toolbar">
            <Button type="button" label="Agregar línea" icon="pi pi-plus" text onClick={addLinea} />
          </div>
          {lineasError && <small className="p-error">{lineasError}</small>}

          <div className="orden-form-total">
            <span>Total:</span>
            <span>{formatCurrency(totalOrden)}</span>
          </div>
        </Card>

        <div className="orden-form-actions" style={{ marginTop: '1.5rem' }}>
          <Button
            type="button"
            label="Cancelar"
            text
            onClick={() => navigate(isEditMode ? `/ordenes/${ordenId}` : '/ordenes')}
          />
          <Button type="submit" label="Guardar Orden" icon="pi pi-check" loading={mutation.isPending} />
        </div>
      </form>
    </div>
  );
}
