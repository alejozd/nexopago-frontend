import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useCambiarPasswordUsuario } from '../../hooks/usuarios/useCambiarPasswordUsuario';
import type { UsuarioListItem } from '../../types/usuario.types';
import '../../assets/styles/proveedores.css';

const cambiarPasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

type CambiarPasswordFormValues = z.infer<typeof cambiarPasswordSchema>;

interface CambiarPasswordDialogProps {
  visible: boolean;
  usuario: UsuarioListItem | null;
  onHide: () => void;
}

export function CambiarPasswordDialog({ visible, usuario, onHide }: CambiarPasswordDialogProps) {
  const mutation = useCambiarPasswordUsuario();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CambiarPasswordFormValues>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: { password: '', confirmarPassword: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ password: '', confirmarPassword: '' });
    }
  }, [visible, reset]);

  const onSubmit = (values: CambiarPasswordFormValues) => {
    if (!usuario) return;
    mutation.mutate({ id: usuario.id, dto: { password: values.password } }, { onSuccess: onHide });
  };

  return (
    <Dialog
      header={usuario ? `Cambiar Contraseña — ${usuario.nombreUsuario}` : 'Cambiar Contraseña'}
      visible={visible}
      onHide={onHide}
      style={{ width: '28rem' }}
      modal
    >
      <form onSubmit={handleSubmit(onSubmit)} className="proveedor-form" noValidate>
        <div className="field">
          <label htmlFor="password">Nueva Contraseña</label>
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

        <div className="field">
          <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
          <Controller
            name="confirmarPassword"
            control={control}
            render={({ field }) => (
              <Password
                id="confirmarPassword"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                toggleMask
                feedback={false}
              />
            )}
          />
          {errors.confirmarPassword && <small className="p-error">{errors.confirmarPassword.message}</small>}
        </div>

        <div className="dialog-footer">
          <Button type="button" label="Cancelar" text onClick={onHide} />
          <Button type="submit" label="Guardar" loading={mutation.isPending} />
        </div>
      </form>
    </Dialog>
  );
}
