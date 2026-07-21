import { useEffect, useRef, useState } from 'react';
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
import { confirmDialog } from 'primereact/confirmdialog';
import { useProveedoresQuery } from '../../hooks/proveedores/useProveedoresQuery';
import { useCreateOrden } from '../../hooks/ordenes/useCreateOrden';
import { useUpdateOrden } from '../../hooks/ordenes/useUpdateOrden';
import { useOrdenDetalleQuery } from '../../hooks/ordenes/useOrdenDetalleQuery';
import { getProductos } from '../../services/productos.service';
import { formatCurrency } from '../../utils/formatters';
import { BuscarPedidoHelisaDialog } from './BuscarPedidoHelisaDialog';
import type { Producto } from '../../types/producto.types';
import type { OrdenLineaCreateDTO } from '../../types/orden.types';
import type { HelisaPedidoDetalle, HelisaPedidoResumen } from '../../types/helisaPedido.types';
import '../../assets/styles/orden-form.css';

const PRODUCTO_SEARCH_MIN_CHARS = 2;
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300;

const headerSchema = z.object({
  proveedorId: z.number({ error: 'El proveedor es obligatorio' }).min(1, 'El proveedor es obligatorio'),
  fechaOrden: z.date({ error: 'La fecha es obligatoria' }),
  numeroPedidoHelisa: z.string().min(1, 'Debe seleccionar un pedido ERP'),
  observaciones: z.string(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface LineaForm {
  producto: Producto | null;
  cantidad: number;
  precioUnitario: number;
  // Consecutivo de la linea del pedido Helisa de la que salio esta linea;
  // null si se agrego manualmente (boton "Agregar línea", sin pasar por el
  // buscador de pedidos).
  consecutivoPedidoHelisa: number | null;
  // Saldo disponible que informo el backend al traer la linea desde el
  // buscador (tope para el input de Cantidad). null cuando no se conoce: ni
  // en lineas manuales ni en lineas ya guardadas de una orden en edicion (el
  // backend es la fuente de verdad final; si igual se excede, responde 400).
  cantidadMaximaHelisa: number | null;
}

function crearLineaVacia(): LineaForm {
  return { producto: null, cantidad: 1, precioUnitario: 0, consecutivoPedidoHelisa: null, cantidadMaximaHelisa: null };
}

// Producto "sentinela" (id: 0) para una linea del pedido Helisa cuya
// referencia no tiene match en el catalogo local (aun no sincronizado): se
// muestra igual, con la referencia visible, pero con id invalido a propósito
// para que el usuario deba resolverla a mano antes de poder guardar (ver
// validacion de "lineasSinResolver" en onSubmit).
function productoNoSincronizado(referencia: string, descripcion: string): Producto {
  return {
    id: 0,
    codigoHelisa: '',
    subCodigoHelisa: '',
    codigoInterno: referencia,
    descripcion: `${descripcion} (no sincronizado, ref. ${referencia})`,
    unidadMedida: null,
    precioReferencia: null,
    activo: true,
  };
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
  const createMutation = useCreateOrden();
  const updateMutation = useUpdateOrden();
  const mutation = isEditMode ? updateMutation : createMutation;

  const [lineas, setLineas] = useState<LineaForm[]>([crearLineaVacia()]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [lineasError, setLineasError] = useState<string | null>(null);
  const [buscarPedidoVisible, setBuscarPedidoVisible] = useState(false);
  const [isResolvingPedido, setIsResolvingPedido] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
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
          consecutivoPedidoHelisa: linea.consecutivoPedidoHelisa,
          // No se conoce un saldo "fresco" para una linea ya guardada (no
          // viene del buscador en este render); el backend valida al guardar.
          cantidadMaximaHelisa: null,
        })),
      );
    }
  }, [isEditMode, orden, reset]);

  const proveedorOptions = proveedoresData?.data ?? [];

  // El catálogo de Productos sincronizado con Helisa tiene ~47.000 registros:
  // la búsqueda se hace en el servidor (paginada, ya soportada por
  // GET /productos?search=), nunca se carga la lista completa al formulario.
  const searchProductos = (event: AutoCompleteCompleteEvent) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const query = event.query.trim();
    if (query.length < PRODUCTO_SEARCH_MIN_CHARS) {
      setFilteredProductos([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const resultado = await getProductos({ page: 1, rows: 20, search: query });
      setFilteredProductos(resultado.data);
    }, PRODUCTO_SEARCH_DEBOUNCE_MS);
  };

  const updateLinea = (index: number, patch: Partial<LineaForm>) => {
    setLineas((prev) => prev.map((linea, i) => (i === index ? { ...linea, ...patch } : linea)));
  };

  const addLinea = () => setLineas((prev) => [...prev, crearLineaVacia()]);

  const removeLinea = (index: number) => setLineas((prev) => prev.filter((_, i) => i !== index));

  // Al confirmar un pedido en el buscador: el N° Pedido queda fijo (solo
  // lectura) y cada linea del pedido se resuelve contra el catalogo local
  // por REFERENCIA (= CODIGO_INTERNO local, ver sync de Productos). Si una
  // referencia no tiene match local (producto aun no sincronizado), la linea
  // se agrega igual mostrando la referencia, sin bloquear el flujo -el
  // usuario la completa o la elimina antes de guardar.
  const handleConfirmPedidoHelisa = async (pedido: HelisaPedidoResumen, detalle: HelisaPedidoDetalle) => {
    setValue('numeroPedidoHelisa', pedido.numeroPedido, { shouldValidate: true });
    setIsResolvingPedido(true);
    try {
      const nuevasLineas = await Promise.all(
        detalle.lineas.map(async (linea): Promise<LineaForm> => {
          // El dialogo ya filtro las lineas agotadas (saldoDisponible <= 0):
          // lo que llega aca siempre tiene saldo > 0. La cantidad por
          // defecto es 1 (o el saldo si es menor a 1), topeada al saldo.
          const cantidadPorDefecto = Math.min(1, linea.saldoDisponible);
          const resultado = await getProductos({ page: 1, rows: 1, search: linea.referencia });
          const productoLocal = resultado.data[0];
          if (productoLocal) {
            return {
              producto: productoLocal,
              cantidad: cantidadPorDefecto,
              precioUnitario: productoLocal.precioReferencia ?? 0,
              consecutivoPedidoHelisa: linea.consecutivo,
              cantidadMaximaHelisa: linea.saldoDisponible,
            };
          }
          return {
            producto: productoNoSincronizado(linea.referencia, linea.descripcion),
            cantidad: cantidadPorDefecto,
            precioUnitario: 0,
            consecutivoPedidoHelisa: linea.consecutivo,
            cantidadMaximaHelisa: linea.saldoDisponible,
          };
        }),
      );
      setLineas(nuevasLineas);
      setLineasError(null);
    } finally {
      setIsResolvingPedido(false);
    }
  };

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
    if (lineas.some((linea) => linea.producto?.id === 0)) {
      setLineasError(
        'Hay líneas del pedido ERP sin producto local encontrado: selecciona el producto correcto o elimina la línea.',
      );
      return;
    }

    const detalles: OrdenLineaCreateDTO[] = lineas
      .filter((linea) => linea.producto !== null)
      .map((linea) => ({
        productoId: linea.producto!.id,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
        consecutivoPedidoHelisa: linea.consecutivoPedidoHelisa,
      }));

    if (detalles.length === 0) {
      setLineasError('Agrega al menos una línea con un producto seleccionado.');
      return;
    }
    if (detalles.some((linea) => linea.cantidad <= 0)) {
      setLineasError('Todas las líneas deben tener una cantidad mayor a cero.');
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

    const proveedorNombre = proveedorOptions.find((p) => p.id === values.proveedorId)?.nombre ?? '';

    confirmDialog({
      header: isEditMode ? 'Confirmar cambios' : 'Confirmar nueva orden',
      message: `¿${isEditMode ? 'Guardar los cambios de la orden' : 'Crear la orden'} para "${proveedorNombre}" con ${detalles.length} línea(s) por un total de ${formatCurrency(totalOrden)}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: isEditMode ? 'Guardar' : 'Crear orden',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (isEditMode && ordenId !== undefined) {
          updateMutation.mutate({ id: ordenId, dto }, { onSuccess: () => navigate(`/ordenes/${ordenId}`) });
        } else {
          createMutation.mutate(dto, { onSuccess: ({ id: newId }) => navigate(`/ordenes/${newId}`) });
        }
      },
    });
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
              <label htmlFor="numeroPedidoHelisa">N° Pedido ERP</label>
              <div className="orden-form-pedido-helisa">
                <InputText id="numeroPedidoHelisa" readOnly {...register('numeroPedidoHelisa')} />
                <Button
                  type="button"
                  icon="pi pi-search"
                  label="Buscar Pedido"
                  outlined
                  onClick={() => setBuscarPedidoVisible(true)}
                />
              </div>
              {errors.numeroPedidoHelisa && <small className="p-error">{errors.numeroPedidoHelisa.message}</small>}
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
          <DataTable
            value={lineas}
            dataKey={undefined}
            size="small"
            loading={isResolvingPedido}
            className="orden-form-lineas-table"
          >
            <Column
              header="Producto"
              body={(row: LineaForm, options: ColumnBodyOptions) => (
                <AutoComplete
                  value={row.producto}
                  suggestions={filteredProductos}
                  completeMethod={searchProductos}
                  field="descripcion"
                  placeholder="Escribe al menos 2 letras para buscar..."
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
                <div className="orden-form-cantidad-cell">
                  <InputNumber
                    value={row.cantidad}
                    onValueChange={(e) => updateLinea(options.rowIndex, { cantidad: e.value ?? 0 })}
                    min={0}
                    max={row.cantidadMaximaHelisa ?? undefined}
                    mode="decimal"
                    minFractionDigits={0}
                  />
                  {row.cantidadMaximaHelisa !== null && (
                    <small className="orden-form-cantidad-hint">Máx. disponible: {row.cantidadMaximaHelisa}</small>
                  )}
                </div>
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

      <BuscarPedidoHelisaDialog
        visible={buscarPedidoVisible}
        onHide={() => setBuscarPedidoVisible(false)}
        onConfirm={handleConfirmPedidoHelisa}
        ordenId={ordenId}
      />
    </div>
  );
}
