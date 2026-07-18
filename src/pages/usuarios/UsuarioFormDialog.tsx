import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { usePerfilesQuery } from '../../hooks/permisos/usePerfilesQuery';
import { useCreateUsuario } from '../../hooks/usuarios/useCreateUsuario';
import { useUpdateUsuario } from '../../hooks/usuarios/useUpdateUsuario';
import type { UsuarioListItem } from '../../types/usuario.types';
import '../../assets/styles/proveedores.css';

// nombreUsuario/password no se validan aqui con min() porque solo aplican
// en modo creacion (en edicion ni se muestran ni se envian) - se validan a
// mano en onSubmit con setError, mas simple que dos schemas zod distintos
// para un unico formulario con dos modos.
const usuarioSchema = z.object({
  nombreUsuario: z.string(),
  password: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string(),
  correoElectronico: z.union([z.literal(''), z.string().email('Correo electrónico inválido')]),
  perfilIds: z.array(z.number()).min(1, 'Debe asignar al menos un perfil'),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface UsuarioFormDialogProps {
  visible: boolean;
  usuario?: UsuarioListItem | null;
  onHide: () => void;
}

function toFormValues(usuario?: UsuarioListItem | null): UsuarioFormValues {
  return {
    nombreUsuario: usuario?.nombreUsuario ?? '',
    password: '',
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    correoElectronico: '',
    perfilIds: usuario?.perfilIds ?? [],
  };
}

export function UsuarioFormDialog({ visible, usuario, onHide }: UsuarioFormDialogProps) {
  const isEditMode = Boolean(usuario);
  const { data: perfilesData } = usePerfilesQuery();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: toFormValues(usuario),
  });

  useEffect(() => {
    if (visible) {
      reset(toFormValues(usuario));
    }
  }, [usuario, reset, visible]);

  const perfilOptions = perfilesData?.data ?? [];

  const onSubmit = (values: UsuarioFormValues) => {
    if (!isEditMode) {
      if (values.nombreUsuario.trim() === '') {
        setError('nombreUsuario', { message: 'El usuario es obligatorio' });
        return;
      }
      if (values.password.trim().length < 6) {
        setError('password', { message: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }
    }

    if (isEditMode && usuario) {
      updateMutation.mutate(
        {
          id: usuario.id,
          dto: {
            nombre: values.nombre.trim(),
            apellido: values.apellido.trim() || null,
            correoElectronico: values.correoElectronico.trim() || null,
            perfilIds: values.perfilIds,
          },
        },
        { onSuccess: onHide },
      );
    } else {
      createMutation.mutate(
        {
          nombreUsuario: values.nombreUsuario.trim(),
          password: values.password,
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim() || null,
          correoElectronico: values.correoElectronico.trim() || null,
          perfilIds: values.perfilIds,
        },
        { onSuccess: onHide },
      );
    }
  };

  return (
    <Dialog
      header={isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
      visible={visible}
      onHide={onHide}
      style={{ width: '40rem' }}
      modal
    >
      <form onSubmit={handleSubmit(onSubmit)} className="proveedor-form" noValidate>
        {!isEditMode && (
          <div className="field-row">
            <div className="field">
              <label htmlFor="nombreUsuario">Usuario</label>
              <InputText id="nombreUsuario" autoFocus {...register('nombreUsuario')} />
              {errors.nombreUsuario && <small className="p-error">{errors.nombreUsuario.message}</small>}
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    id="password"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    toggleMask
                    feedback={false}
                  />
                )}
              />
              {errors.password && <small className="p-error">{errors.password.message}</small>}
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" {...register('nombre')} />
            {errors.nombre && <small className="p-error">{errors.nombre.message}</small>}
          </div>
          <div className="field">
            <label htmlFor="apellido">Apellido</label>
            <InputText id="apellido" {...register('apellido')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="correoElectronico">Correo</label>
          <InputText id="correoElectronico" type="email" {...register('correoElectronico')} />
          {errors.correoElectronico && <small className="p-error">{errors.correoElectronico.message}</small>}
        </div>

        <div className="field">
          <label htmlFor="perfilIds">Perfiles</label>
          <Controller
            name="perfilIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                id="perfilIds"
                value={field.value}
                options={perfilOptions}
                optionLabel="nombre"
                optionValue="id"
                placeholder="Selecciona uno o más perfiles"
                display="chip"
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
          {errors.perfilIds && <small className="p-error">{errors.perfilIds.message}</small>}
        </div>

        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Guardar" loading={mutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
