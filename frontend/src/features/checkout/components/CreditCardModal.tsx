import { Lock, X } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Stepper } from '../../../shared/ui/Stepper';
import { detectCardBrand } from '../validators/cardBrand';
import { CheckoutFieldName, CheckoutFormValues, VALIDATORS } from '../validators/validateField';
import { formatCardHolder, formatCardNumber, formatCvc, formatExpiry, formatPhone } from '../format';
import { CardBrandLogos } from './CardBrandLogos';

const EMPTY_VALUES: CheckoutFormValues = {
  cardNumber: '',
  cardHolder: '',
  expiry: '',
  cvc: '',
  address: '',
  city: '',
  phone: '',
};

const TEST_CARD: CheckoutFormValues = {
  cardNumber: '4242 4242 4242 4242',
  cardHolder: 'Jane Doe',
  expiry: '12/29',
  cvc: '123',
  address: 'Calle 123 #45-67, apto 8',
  city: 'Bogotá',
  phone: '300 123 4567',
};

interface CreditCardModalProps {
  onClose: () => void;
  onSubmit: (values: CheckoutFormValues) => void;
  /** Retry flow: keeps everything except the CVC, which is always re-entered (spec §5.4). */
  initialValues?: Partial<CheckoutFormValues>;
}

export function CreditCardModal({ onClose, onSubmit, initialValues }: CreditCardModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const [values, setValues] = useState<CheckoutFormValues>({ ...EMPTY_VALUES, ...initialValues, cvc: '' });
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

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(255,255,255,0.78)] backdrop-blur-sm sm:items-center"
      onKeyDown={(event) => event.key === 'Escape' && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-card-modal-title"
        className="flex h-[100dvh] w-full flex-col bg-panel shadow-3 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:max-w-sheet sm:rounded-lg"
      >
        <div className="safe-top shrink-0 border-b border-line px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-overline uppercase text-fg-3">Paso 2 de 4</p>
              <h2 id="credit-card-modal-title" className="mt-1 font-display text-[20px] font-semibold text-fg-1">
                Datos de pago y entrega
              </h2>
            </div>
            <Button variant="icon" aria-label="Cerrar" onClick={onClose}>
              <X size={22} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-3">
            <Stepper currentStep={2} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{ scrollPaddingBottom: '24px' }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" style={{ overscrollBehavior: 'contain' }}>
            <fieldset className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <legend className="font-display text-[16px] font-semibold text-fg-1">Tarjeta de crédito</legend>
                <span className="flex items-center gap-1 text-[13px] text-success">
                  <Lock size={14} strokeWidth={1.75} aria-hidden="true" /> Conexión cifrada
                </span>
              </div>

              <div>
                <Input
                  label="Número de tarjeta"
                  name="cardNumber"
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
                  <p className="mt-1 text-[13px] text-fg-3">
                    {brand === 'VISA' ? 'VISA detectada' : 'MasterCard detectada'}
                  </p>
                )}
              </div>

              <Input
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
                <Input
                  label="Vencimiento"
                  name="expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  value={values.expiry}
                  onChange={handleExpiryChange}
                  onBlur={() => handleBlur('expiry')}
                  error={showError('expiry')}
                />
                <Input
                  label="CVC"
                  name="cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={values.cvc}
                  onChange={(event) => setValue('cvc', formatCvc(event.target.value))}
                  onBlur={() => handleBlur('cvc')}
                  error={showError('cvc')}
                />
              </div>
            </fieldset>

            <div className="my-7 border-t border-line" />

            <fieldset className="flex flex-col gap-4">
              <legend className="font-display text-[16px] font-semibold text-fg-1">Entrega</legend>

              <Input
                label="Dirección"
                name="address"
                autoComplete="street-address"
                value={values.address}
                onChange={(event) => setValue('address', event.target.value)}
                onBlur={() => handleBlur('address')}
                error={showError('address')}
              />

              <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                <Input
                  label="Ciudad"
                  name="city"
                  autoComplete="address-level2"
                  value={values.city}
                  onChange={(event) => setValue('city', event.target.value)}
                  onBlur={() => handleBlur('city')}
                  error={showError('city')}
                />
                <Input
                  label="Celular"
                  name="phone"
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
              <div className="mt-6 rounded border border-dashed border-line-strong p-3">
                <p className="text-[13px] font-medium text-fg-2">Modo prueba</p>
                <button
                  type="button"
                  className="mt-1 text-[14px] font-medium text-primary hover:underline"
                  onClick={() => setValues(TEST_CARD)}
                >
                  Usar tarjeta de prueba
                </button>
              </div>
            )}
          </div>

          <div className="safe-bottom shrink-0 border-t border-line px-5 py-4">
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
      </div>
    </div>
  );
}
