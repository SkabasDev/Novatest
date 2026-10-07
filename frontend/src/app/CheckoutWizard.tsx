import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { Toast } from '../shared/ui/Toast';
import { CreditCardModal } from '../features/checkout/components/CreditCardModal';
import { ResultScreen } from '../features/checkout/components/ResultScreen';
import { SummaryBackdrop } from '../features/checkout/components/SummaryBackdrop';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../features/checkout/constants';
import {
  goToStep,
  resetCheckout,
  retryPayment,
  setCheckoutSummary,
  STEP_NUMBER,
  submitPayment,
} from '../features/checkout/checkoutSlice';
import { detectCardBrand } from '../features/checkout/validators/cardBrand';
import { CheckoutFormValues } from '../features/checkout/validators/validateField';
import { applyStockUpdate } from '../features/product/productSlice';
import { ProductPage } from '../features/product/components/ProductPage';

const TOAST_DURATION_MS = 6000;

/**
 * Orchestrates the 5-screen flow. The product screen is always the base layer; the card/delivery
 * modal and the summary backdrop render as overlays on top of it and repeat their own
 * header/stepper since they visually cover the page header. The result screen replaces the
 * product screen outright (spec §5.4), per the flow diagram in §8.
 *
 * Full card data (PAN/CVC) lives only here, in memory — it is never dispatched to Redux/
 * localStorage, so a page refresh can never resurrect it. Only the non-sensitive last4/brand are
 * stored in the checkout slice for the summary and result screens to display.
 */
export function CheckoutWizard() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const quantity = useAppSelector((state) => state.checkout.quantity);
  const summary = useAppSelector((state) => state.checkout.summary);
  const paymentStatus = useAppSelector((state) => state.checkout.paymentStatus);
  const result = useAppSelector((state) => state.checkout.result);
  const product = useAppSelector((state) => state.product.items[0]);
  const [cardValues, setCardValues] = useState<CheckoutFormValues | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (step === 'card-delivery') setToastMessage(null);
  }, [step]);

  useEffect(() => () => clearTimeout(toastTimeoutRef.current), []);

  function handleModalSubmit(values: CheckoutFormValues) {
    if (!product) return;
    setCardValues(values);

    const digits = values.cardNumber.replace(/\D/g, '');
    dispatch(
      setCheckoutSummary({
        productName: product.name,
        unitPriceInCents: product.priceInCents,
        quantity,
        baseFeeInCents: BASE_FEE_IN_CENTS,
        deliveryFeeInCents: DELIVERY_FEE_IN_CENTS,
        delivery: { address: values.address, city: values.city, phone: values.phone },
        cardLast4: digits.slice(-4),
        cardBrand: detectCardBrand(digits),
      }),
    );
  }

  function handleBackToStore() {
    if (product && summary) {
      const newStock = Math.max(0, product.stock - summary.quantity);
      dispatch(applyStockUpdate({ productId: product.id, stock: newStock }));
      setToastMessage(`Stock actualizado: quedan ${newStock} unidades.`);
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    }
    setCardValues(null);
    dispatch(resetCheckout());
  }

  return (
    <div className="min-h-screen bg-base">
      <Header currentStep={STEP_NUMBER[step]} />
      {toastMessage && <Toast message={toastMessage} />}
      <main>
        {step === 'result' && summary && result ? (
          <ResultScreen
            summary={summary}
            result={result}
            onRetry={() => dispatch(retryPayment())}
            onBackToStore={handleBackToStore}
          />
        ) : (
          <ProductPage />
        )}
      </main>

      {step === 'card-delivery' && (
        <CreditCardModal
          onClose={() => dispatch(goToStep(summary ? 'summary' : 'product'))}
          onSubmit={handleModalSubmit}
          initialValues={cardValues ?? undefined}
        />
      )}

      {step === 'summary' && summary && (
        <SummaryBackdrop
          summary={summary}
          isProcessing={paymentStatus === 'processing'}
          onPay={() => cardValues && dispatch(submitPayment(cardValues.cardNumber))}
          onEditData={() => dispatch(goToStep('card-delivery'))}
          onDismiss={() => dispatch(goToStep('card-delivery'))}
        />
      )}
    </div>
  );
}
