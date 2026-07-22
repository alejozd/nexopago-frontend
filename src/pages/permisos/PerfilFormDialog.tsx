import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useCreatePerfil } from '../../hooks/permisos/useCreatePerfil';
import { useUpdatePerfil } from '../../hooks/permisos/useUpdatePerfil';
import type { Perfil } from '../../types/permiso.types';
import '../../assets/styles/proveedores.css';

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string(),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

interface PerfilFormDialogProps {
  visible: boolean;
  perfil?: Perfil | null;
  onHide: () => void;
}

function toFormValues(perfil?: Perfil | null): PerfilFormValues {
  return {
    nombre: perfil?.nombre ?? '',
    descripcion: perfil?.descripcion ?? '',
  };
}

export function PerfilFormDialog({ visible, perfil, onHide }: PerfilFormDialogProps) {
  const isEditMode = Boolean(perfil);
  const createMutation = useCreatePerfil();
  const updateMutation = useUpdatePerfil();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: toFormValues(perfil),
  });

  useEffect(() => {
    if (visible) {
      reset(toFormValues(perfil));
    }
  }, [perfil, reset, visible]);

  const onSubmit = (values: PerfilFormValues) => {
    const dto = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() || null,
    };

    if (isEditMode && perfil) {
      updateMutation.mutate({ id: perfil.id, dto }, { onSuccess: onHide });
    } else {
      createMutation.mutate(dto, { onSuccess: onHide });
    }
  };

  return (
    <Dialog
      header={isEditMode ? 'Editar Perfil' : 'Nuevo Perfil'}
      visible={visible}
      onHide={onHide}
      style={{ width: '30rem' }}
      modal
    >
      <form onSubmit={handleSubmit(onSubmit)} className="proveedor-form" noValidate>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <InputText id="nombre" autoFocus {...register('nombre')} />
          {errors.nombre && <small className="p-error">{errors.nombre.message}</small>}
        </div>

        <div className="field">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea id="descripcion" rows={3} {...register('descripcion')} />
        </div>

        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Guardar" loading={mutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
