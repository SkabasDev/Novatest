import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/Button';
import { Field } from '../../../shared/ui/Field';
import { registerUser } from '../authSlice';
import {
  validateConfirmPassword,
  validateDocumentId,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '../validators';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormValues = { fullName: '', email: '', phone: '', documentId: '', password: '', confirmPassword: '' };

export function RegisterScreen({ onNavigateToLogin, onSuccess }: RegisterScreenProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const apiError = useAppSelector((state) => state.auth.error);

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors: Partial<Record<keyof FormValues, string>> = {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    documentId: validateDocumentId(values.documentId),
    password: validatePassword(values.password),
    confirmPassword: validateConfirmPassword(values.confirmPassword, values.password),
  };

  function setValue<K extends keyof FormValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const showError = (field: keyof FormValues) => (touched[field] || submitAttempted ? errors[field] : undefined);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.values(errors).some(Boolean)) return;

    try {
      await dispatch(
        registerUser({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          documentId: values.documentId,
          password: values.password,
        }),
      ).unwrap();
      onSuccess();
    } catch {
      // error already lands in auth.error via the rejected action (e.g. email already registered)
    }
  }

  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">Crea tu cuenta</h1>
        <p className="mt-1 text-[14px] text-fg-3">
          Lo pedimos una sola vez. En tus próximas compras solo pondrás la tarjeta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Nombre completo"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) => setValue('fullName', event.target.value)}
          onBlur={() => markTouched('fullName')}
          error={showError('fullName')}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValue('email', event.target.value)}
          onBlur={() => markTouched('email')}
          error={showError('email')}
        />
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <Field
            label="Celular"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => setValue('phone', event.target.value)}
            onBlur={() => markTouched('phone')}
            error={showError('phone')}
          />
          <Field
            label="Cédula"
            name="documentId"
            value={values.documentId}
            onChange={(event) => setValue('documentId', event.target.value)}
            onBlur={() => markTouched('documentId')}
            error={showError('documentId')}
          />
        </div>
        <Field
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          revealable
          value={values.password}
          onChange={(event) => setValue('password', event.target.value)}
          onBlur={() => markTouched('password')}
          error={showError('password')}
          hint={showError('password') ? undefined : 'Mínimo 8 caracteres, con letras y números.'}
        />
        <Field
          label="Confirmar contraseña"
          name="confirmPassword"
          autoComplete="new-password"
          revealable
          value={values.confirmPassword}
          onChange={(event) => setValue('confirmPassword', event.target.value)}
          onBlur={() => markTouched('confirmPassword')}
          error={showError('confirmPassword')}
        />

        {apiError && (
          <div role="alert" className="flex items-center gap-2 rounded border border-danger/35 bg-danger-tint px-3.5 py-3 text-[13px] text-danger">
            <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
            {apiError}
          </div>
        )}

        <Button type="submit" size="large" isLoading={status === 'loading'} loadingText="Creando cuenta…">
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-[14px] text-fg-3">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onNavigateToLogin} className="font-semibold text-primary hover:underline">
          Inicia sesión
        </button>
      </p>
    </div>
  );
}
