import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { CreditCardModal } from '../features/checkout/components/CreditCardModal';
import { SummaryBackdrop } from '../features/checkout/components/SummaryBackdrop';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../features/checkout/constants';
import { STEP_NUMBER, goToStep, setCheckoutSummary, submitPayment } from '../features/checkout/checkoutSlice';
import { detectCardBrand } from '../features/checkout/validators/cardBrand';
import { CheckoutFormValues } from '../features/checkout/validators/validateField';
import { ProductPage } from '../features/product/components/ProductPage';

/**
 * Orchestrates the 5-screen flow. The product screen is always the base layer; the card/delivery
 * modal, the summary backdrop and the result screen render as overlays on top of it and repeat
 * their own header/stepper since they visually cover the page header.
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
  const product = useAppSelector((state) => state.product.items[0]);
  const [cardValues, setCardValues] = useState<CheckoutFormValues | null>(null);

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

  return (
    <div className="min-h-screen bg-base">
      <Header currentStep={STEP_NUMBER[step]} />
      <main>
        <ProductPage />
      </main>

      {step === 'card-delivery' && (
        <CreditCardModal
          onClose={() => dispatch(goToStep('product'))}
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
