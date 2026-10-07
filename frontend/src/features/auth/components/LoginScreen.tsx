import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/Button';
import { Field } from '../../../shared/ui/Field';
import { loginUser } from '../authSlice';
import { validateLoginEmail, validateLoginPassword } from '../validators';
import { PendingPurchaseCard, PendingSummary } from './PendingPurchaseCard';

interface LoginScreenProps {
  pendingSummary?: PendingSummary;
  backLabel: string;
  onBack: () => void;
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export function LoginScreen({ pendingSummary, backLabel, onBack, onNavigateToRegister, onSuccess }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [credentialsErrorDismissed, setCredentialsErrorDismissed] = useState(false);

  const emailError = validateLoginEmail(email);
  const passwordError = validateLoginPassword(password);
  const showError = (field: 'email' | 'password') =>
    (touched[field] || submitAttempted) ? (field === 'email' ? emailError : passwordError) : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (emailError || passwordError) return;

    setCredentialsErrorDismissed(false);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      onSuccess();
    } catch {
      // error already lands in auth.error via the rejected action
    }
  }

  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-5 px-4 py-6">
      <button type="button" onClick={onBack} className="min-h-11 self-start text-[14px] font-medium text-primary">
        {backLabel}
      </button>

      {pendingSummary && <PendingPurchaseCard {...pendingSummary} />}

      <div>
        <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">Inicia sesión</h1>
        <p className="mt-1 text-[14px] text-fg-3">
          {pendingSummary
            ? 'Así tus datos de entrega se cargan solos y solo tendrás que poner la tarjeta.'
            : 'Ingresa con tu email y contraseña.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setCredentialsErrorDismissed(true);
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={showError('email')}
        />
        <Field
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          revealable
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setCredentialsErrorDismissed(true);
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={showError('password')}
        />

        {error && !credentialsErrorDismissed && (
          <div role="alert" className="flex items-center gap-2 rounded border border-danger/35 bg-danger-tint px-3.5 py-3 text-[13px] text-danger">
            <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <Button type="submit" size="large" isLoading={status === 'loading'} loadingText="Verificando…">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-[14px] text-fg-3">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onNavigateToRegister} className="font-semibold text-primary hover:underline">
          Crear cuenta
        </button>
      </p>
    </div>
  );
}
