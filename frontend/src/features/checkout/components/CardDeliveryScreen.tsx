import { Lock } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/Button';
import { Field } from '../../../shared/ui/Field';
import { detectCardBrand } from '../validators/cardBrand';
import { CheckoutFieldName, CheckoutFormValues, VALIDATORS } from '../validators/validateField';
import { formatCardHolder, formatCardNumber, formatCvc, formatExpiry, formatPhone } from '../format';
import { CardBrandLogos } from './CardBrandLogos';

const TEST_CARD: CheckoutFormValues = {
  cardNumber: '4242 4242 4242 4242',
  cardHolder: 'Jane Doe',
  expiry: '12/29',
  cvc: '123',
  address: 'Calle 123 #45-67, apto 8',
  city: 'Bogotá',
  phone: '300 123 4567',
};

interface CardDeliveryScreenProps {
  /** "‹ {producto}" for buy-now, "‹ Carrito" for a cart checkout (spec §11.11/§12.5). */
  backLabel: string;
  onBack: () => void;
  /** "{producto} × N · subtotal" (single line) or "N productos · subtotal" (cart) — computed by the caller. */
  headerSummary: string;
  onSubmit: (values: CheckoutFormValues) => void;
  /** Retry flow: keeps everything except the CVC, which is always re-entered (spec §5.4/§12.5). */
  initialValues?: Partial<CheckoutFormValues>;
}

/**
 * "Tarjeta y entrega" as a full page (spec v2 §11.11 — replaces the v1 modal, which stays
 * untouched for that version). Normal page scroll, sticky CTA on mobile, no overlay/focus-trap.
 */
export function CardDeliveryScreen({ backLabel, headerSummary, onBack, onSubmit, initialValues }: CardDeliveryScreenProps) {
  const user = useAppSelector((state) => state.auth.user);

  const prefill: CheckoutFormValues = {
    cardNumber: '',
    cardHolder: user?.fullName ?? '',
    expiry: '',
    cvc: '',
    address: user?.defaultAddress ?? '',
    city: user?.defaultCity ?? '',
    phone: user?.phone ?? '',
  };
  const [isAddressFromProfile] = useState(Boolean(user?.defaultAddress) && !initialValues?.address);
  const [values, setValues] = useState<CheckoutFormValues>({ ...prefill, ...initialValues, cvc: '' });
  const [shown, setShown] = useState<Partial<Record<CheckoutFieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const brand = detectCardBrand(values.cardNumber);
  const errors: Partial<Record<CheckoutFieldName, string>> = {};
  (Object.keys(VALIDATORS) as CheckoutFieldName[]).forEach((field) => {
    errors[field] = VALIDATORS[field](values[field]);
  });
  const visibleErrorCount = (Object.keys(errors) as CheckoutFieldName[]).filter(
    (field) => errors[field] && (shown[field] || submitAttempted),
  ).length;

  function setValue(field: CheckoutFieldName, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function markShown(field: CheckoutFieldName) {
    setShown((prev) => ({ ...prev, [field]: true }));
  }

  function handleBlur(field: CheckoutFieldName) {
    if (values[field].length > 0) markShown(field);
  }

  function handleCardNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const formatted = formatCardNumber(event.target.value);
    setValue('cardNumber', formatted);
    if (formatted.replace(/\D/g, '').length === 16) markShown('cardNumber');
  }

  function handleExpiryChange(event: ChangeEvent<HTMLInputElement>) {
    const formatted = formatExpiry(event.target.value);
    setValue('expiry', formatted);
    if (formatted.length === 5) markShown('expiry');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitAttempted(true);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return;

    onSubmit(values);
  }

  const showError = (field: CheckoutFieldName) => (shown[field] || submitAttempted ? errors[field] : undefined);
  const initials = getInitials(user?.fullName ?? '');

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sheet flex-col gap-6 px-4 py-6 pb-28 md:pb-6">
      <button type="button" onClick={onBack} className="min-h-11 self-start text-[14px] font-medium text-primary">
        {backLabel}
      </button>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">
          Tarjeta y entrega
        </h1>
        <span className="text-[14px] text-fg-3">{headerSummary}</span>
      </div>

      {user && (
        <div className="flex items-center gap-3 rounded border border-line bg-inset px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[13px] font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] text-fg-3">Comprando como</p>
            <p className="truncate text-[14px] font-semibold text-fg-1">
              {user.fullName} · {user.email}
            </p>
          </div>
        </div>
      )}

      <fieldset className="flex flex-col gap-4 rounded bg-panel p-4 shadow-1">
        <div className="flex items-center justify-between">
          <legend className="font-display text-[16px] font-semibold text-fg-1">Tarjeta de crédito</legend>
          <span className="flex items-center gap-1 text-[13px] text-success">
            <Lock size={14} strokeWidth={1.75} aria-hidden="true" /> Conexión cifrada
          </span>
        </div>

        <div>
          <Field
            label="Número de tarjeta"
            name="cardNumber"
            mono
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={values.cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur('cardNumber')}
            error={showError('cardNumber')}
            trailing={<CardBrandLogos brand={brand} />}
          />
          {brand !== 'UNKNOWN' && !showError('cardNumber') && (
            <p className="mt-1 text-[13px] text-fg-3">{brand === 'VISA' ? 'VISA detectada' : 'MasterCard detectada'}</p>
          )}
        </div>

        <Field
          label="Nombre del titular"
          name="cardHolder"
          autoComplete="cc-name"
          autoCapitalize="words"
          value={values.cardHolder}
          onChange={(event) => setValue('cardHolder', formatCardHolder(event.target.value))}
          onBlur={() => handleBlur('cardHolder')}
          error={showError('cardHolder')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Vencimiento"
            name="expiry"
            mono
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={values.expiry}
            onChange={handleExpiryChange}
            onBlur={() => handleBlur('expiry')}
            error={showError('expiry')}
          />
          <Field
            label="CVC"
            name="cvc"
            mono
            inputMode="numeric"
            autoComplete="cc-csc"
            value={values.cvc}
            onChange={(event) => setValue('cvc', formatCvc(event.target.value))}
            onBlur={() => handleBlur('cvc')}
            error={showError('cvc')}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded bg-panel p-4 shadow-1">
        <div className="flex items-center justify-between">
          <legend className="font-display text-[16px] font-semibold text-fg-1">Entrega</legend>
          {isAddressFromProfile && <span className="text-[13px] text-fg-3">Desde tu perfil · puedes cambiarla</span>}
        </div>

        <Field
          label="Dirección"
          name="address"
          autoComplete="street-address"
          value={values.address}
          onChange={(event) => setValue('address', event.target.value)}
          onBlur={() => handleBlur('address')}
          error={showError('address')}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Field
            label="Ciudad"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => setValue('city', event.target.value)}
            onBlur={() => handleBlur('city')}
            error={showError('city')}
          />
          <Field
            label="Celular"
            name="phone"
            mono
            type="tel"
            placeholder="300 123 4567"
            value={values.phone}
            onChange={(event) => setValue('phone', formatPhone(event.target.value))}
            onBlur={() => handleBlur('phone')}
            error={showError('phone')}
          />
        </div>
      </fieldset>

      {import.meta.env.DEV && (
        <div className="rounded border border-dashed border-line-strong p-3">
          <p className="text-[13px] font-medium text-fg-2">Modo prueba</p>
          <button
            type="button"
            className="mt-1 text-[14px] font-medium text-primary hover:underline"
            onClick={() => setValues((prev) => ({ ...prev, ...TEST_CARD }))}
          >
            Usar tarjeta de prueba
          </button>
        </div>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-base p-3 md:static md:border-0 md:p-0">
        {submitAttempted && visibleErrorCount > 0 && (
          <p className="mb-2 text-center text-[13px] text-danger">
            Revisa {visibleErrorCount} campo{visibleErrorCount === 1 ? '' : 's'} marcado{visibleErrorCount === 1 ? '' : 's'} para continuar.
          </p>
        )}
        <Button type="submit" size="large">
          Revisar pago
        </Button>
      </div>
    </form>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}
