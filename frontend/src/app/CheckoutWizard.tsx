import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { CreditCardModal } from '../features/checkout/components/CreditCardModal';
import { STEP_NUMBER, goToStep } from '../features/checkout/checkoutSlice';
import { CheckoutFormValues } from '../features/checkout/validators/validateField';
import { ProductPage } from '../features/product/components/ProductPage';

/**
 * Orchestrates the 5-screen flow. The product screen is always the base layer; the card/delivery
 * modal, the summary backdrop and the result screen (added in later PRs) render as overlays on top
 * of it and repeat their own header/stepper since they visually cover the page header.
 *
 * Card data lives only here, in memory — it is never dispatched to Redux/localStorage, so a page
 * refresh can never resurrect a full PAN/CVC.
 */
export function CheckoutWizard() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const [checkoutData, setCheckoutData] = useState<CheckoutFormValues | null>(null);

  function handleModalSubmit(values: CheckoutFormValues) {
    setCheckoutData(values);
    dispatch(goToStep('summary'));
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
          initialValues={checkoutData ?? undefined}
        />
      )}
    </div>
  );
}
