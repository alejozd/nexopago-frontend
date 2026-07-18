import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useCreateProveedor } from '../../hooks/proveedores/useCreateProveedor';
import { useUpdateProveedor } from '../../hooks/proveedores/useUpdateProveedor';
import type { Proveedor, ProveedorCreateDTO } from '../../types/proveedor.types';
import '../../assets/styles/proveedores.css';

const proveedorSchema = z.object({
  nit: z.string().min(1, 'El NIT es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  codigoHelisa: z.string(),
  codigoInterno: z.string(),
  direccion: z.string(),
  telefono: z.string(),
  correoElectronico: z.union([z.literal(''), z.string().email('Correo electrónico inválido')]),
});

type ProveedorFormValues = z.infer<typeof proveedorSchema>;

interface ProveedorFormDialogProps {
  visible: boolean;
  proveedor?: Proveedor | null;
  onHide: () => void;
}

function toFormValues(proveedor?: Proveedor | null): ProveedorFormValues {
  return {
    nit: proveedor?.nit ?? '',
    nombre: proveedor?.nombre ?? '',
    codigoHelisa: proveedor?.codigoHelisa != null ? String(proveedor.codigoHelisa) : '',
    codigoInterno: proveedor?.codigoInterno ?? '',
    direccion: proveedor?.direccion ?? '',
    telefono: proveedor?.telefono ?? '',
    correoElectronico: proveedor?.correoElectronico ?? '',
  };
}

function toDTO(values: ProveedorFormValues): ProveedorCreateDTO {
  const emptyToNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());
  return {
    nit: values.nit.trim(),
    nombre: values.nombre.trim(),
    codigoHelisa: values.codigoHelisa.trim() === '' ? null : Number(values.codigoHelisa),
    codigoInterno: emptyToNull(values.codigoInterno),
    direccion: emptyToNull(values.direccion),
    telefono: emptyToNull(values.telefono),
    correoElectronico: emptyToNull(values.correoElectronico),
  };
}

export function ProveedorFormDialog({ visible, proveedor, onHide }: ProveedorFormDialogProps) {
  const isEditMode = Boolean(proveedor);
  const createMutation = useCreateProveedor();
  const updateMutation = useUpdateProveedor();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: toFormValues(proveedor),
  });

  useEffect(() => {
    if (visible) {
      reset(toFormValues(proveedor));
    }
  }, [proveedor, reset, visible]);

  const onSubmit = (values: ProveedorFormValues) => {
    const dto = toDTO(values);
    if (isEditMode && proveedor) {
      updateMutation.mutate({ id: proveedor.id, dto }, { onSuccess: onHide });
    } else {
      createMutation.mutate(dto, { onSuccess: onHide });
    }
  };

  return (
    <Dialog
      header={isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      visible={visible}
      onHide={onHide}
      style={{ width: '52rem' }}
      modal
    >
      <form onSubmit={handleSubmit(onSubmit)} className="proveedor-form" noValidate>
        <h4 className="proveedor-form-section">Identificación</h4>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <InputText id="nombre" autoFocus {...register('nombre')} />
          {errors.nombre && <small className="p-error">{errors.nombre.message}</small>}
        </div>
        <div className="field-row field-row-identificacion">
          <div className="field">
            <label htmlFor="nit">NIT</label>
            <InputText id="nit" {...register('nit')} />
            {errors.nit && <small className="p-error">{errors.nit.message}</small>}
          </div>
          <div className="field">
            <label htmlFor="codigoHelisa">Código Helisa</label>
            <InputText id="codigoHelisa" {...register('codigoHelisa')} />
          </div>
          <div className="field">
            <label htmlFor="codigoInterno">Código Interno</label>
            <InputText id="codigoInterno" {...register('codigoInterno')} />
          </div>
        </div>

        <Divider />
        <h4 className="proveedor-form-section">Contacto</h4>
        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-map-marker" />
            <InputText id="direccion" className="proveedor-form-input-icon" {...register('direccion')} />
          </IconField>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <IconField iconPosition="left">
              <InputIcon className="pi pi-phone" />
              <InputText id="telefono" className="proveedor-form-input-icon" {...register('telefono')} />
            </IconField>
          </div>
          <div className="field">
            <label htmlFor="correoElectronico">Correo</label>
            <IconField iconPosition="left">
              <InputIcon className="pi pi-envelope" />
              <InputText
                id="correoElectronico"
                type="email"
                className="proveedor-form-input-icon"
                {...register('correoElectronico')}
              />
            </IconField>
            {errors.correoElectronico && <small className="p-error">{errors.correoElectronico.message}</small>}
          </div>
        </div>
        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Guardar" loading={mutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
