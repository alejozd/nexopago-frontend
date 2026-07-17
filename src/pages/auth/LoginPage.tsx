import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useLogin } from '../../hooks/auth/useLogin';
import '../../assets/styles/auth.css';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: 'pi pi-sitemap', text: 'Trazabilidad completa: orden, entrada y pago en una sola línea de tiempo' },
  { icon: 'pi pi-wallet', text: 'Control de cartera y antigüedad de saldos por proveedor' },
  { icon: 'pi pi-building', text: 'Gestión centralizada de proveedores y catálogo de productos' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { mutate, isPending, isError } = useLogin();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutate(values, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
    });
  };

  return (
    <div className="login-page">
      <aside className="login-brand-panel">
        <div className="login-brand-panel-inner np-fade-in-up">
          <span className="login-brand-icon">
            <i className="pi pi-bolt" />
          </span>
          <h1>NexoPago</h1>
          <p className="login-brand-tagline">
            El sistema de trazabilidad de compras y control de cartera que reemplaza el Excel manual.
          </p>
          <ul className="login-features">
            {FEATURES.map((feature) => (
              <li key={feature.text}>
                <span className="login-feature-icon">
                  <i className={feature.icon} />
                </span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="login-form-panel">
        <div className="login-form-wrap np-fade-in-up">
          <div className="login-form-header">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            <div className="field">
              <label htmlFor="username">Usuario</label>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-user" />
                <InputText id="username" autoFocus autoComplete="username" {...register('username')} />
              </IconField>
              {errors.username && <small className="p-error">{errors.username.message}</small>}
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    inputId="password"
                    feedback={false}
                    toggleMask
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    autoComplete="current-password"
                  />
                )}
              />
              {errors.password && <small className="p-error">{errors.password.message}</small>}
            </div>
            {isError && <Message severity="error" text="Usuario o contraseña incorrectos" />}
            <Button type="submit" label="Ingresar" loading={isPending} className="login-submit" />
          </form>

          <p className="login-footer">© 2026 NexoPago — Sistema de Control de Compras</p>
        </div>
      </main>
    </div>
  );
}
