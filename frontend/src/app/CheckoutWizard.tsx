import { useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { STEP_NUMBER } from '../features/checkout/checkoutSlice';
import { ProductPage } from '../features/product/components/ProductPage';

/**
 * Orchestrates the 5-screen flow. The product screen is always the base layer; the card/delivery
 * modal, the summary backdrop and the result screen (added in later PRs) render as overlays on top
 * of it and repeat their own header/stepper since they visually cover the page header.
 */
export function CheckoutWizard() {
  const step = useAppSelector((state) => state.checkout.step);

  return (
    <div className="min-h-screen bg-base">
      <Header currentStep={STEP_NUMBER[step]} />
      <main>
        <ProductPage />
      </main>
    </div>
  );
}
