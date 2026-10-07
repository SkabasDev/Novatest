import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { Toast } from '../shared/ui/Toast';
import { LoginScreen } from '../features/auth/components/LoginScreen';
import { RegisterScreen } from '../features/auth/components/RegisterScreen';
import { logout, setAuthIntent } from '../features/auth/authSlice';
import { CreditCardModal } from '../features/checkout/components/CreditCardModal';
import { ResultScreen } from '../features/checkout/components/ResultScreen';
import { SummaryBackdrop } from '../features/checkout/components/SummaryBackdrop';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../features/checkout/constants';
import {
  goToStep,
  resetCheckout,
  retryPayment,
  setCheckoutSummary,
  startCheckout,
  STEP_NUMBER,
  submitPayment,
} from '../features/checkout/checkoutSlice';
import { detectCardBrand } from '../features/checkout/validators/cardBrand';
import { CheckoutFormValues } from '../features/checkout/validators/validateField';
import { goToCatalog, goToDetail, goToLogin, goToRegister } from '../features/navigation/navigationSlice';
import { applyStockUpdate } from '../features/product/productSlice';
import { CatalogScreen } from '../features/product/components/CatalogScreen';
import { DetailScreen } from '../features/product/components/DetailScreen';

const TOAST_DURATION_MS = 6000;

/**
 * Top-level router: Catalog/Detail/Login/Register (free navigation, spec §11.1) sit under the
 * card-delivery modal, summary backdrop and result screen (the existing payment flow, gated by
 * `checkout.step`). Session is only required at "Pagar" — browsing and the catalog stay free.
 *
 * Full card data (PAN/CVC) lives only in this component's state, in memory — it is never
 * dispatched to Redux/localStorage, so a page refresh can never resurrect it.
 */
export function CheckoutWizard() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const quantity = useAppSelector((state) => state.checkout.quantity);
  const summary = useAppSelector((state) => state.checkout.summary);
  const paymentStatus = useAppSelector((state) => state.checkout.paymentStatus);
  const result = useAppSelector((state) => state.checkout.result);
  const checkoutProductId = useAppSelector((state) => state.checkout.productId);
  const product = useAppSelector((state) => state.product.items.find((item) => item.id === checkoutProductId));
  const user = useAppSelector((state) => state.auth.user);
  const intent = useAppSelector((state) => state.auth.intent);
  const { screen, selectedProductId } = useAppSelector((state) => state.navigation);
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
    dispatch(goToCatalog());
  }

  function handlePay(productId: string) {
    if (user) {
      dispatch(startCheckout(productId));
      return;
    }
    dispatch(setAuthIntent({ pendingProductId: productId }));
    dispatch(goToLogin());
  }

  function handleAuthSuccess() {
    if (typeof intent === 'object' && intent.pendingProductId) {
      const productId = intent.pendingProductId;
      dispatch(setAuthIntent('direct'));
      dispatch(startCheckout(productId));
    } else {
      dispatch(goToCatalog());
    }
  }

  const isCheckoutActive = step !== 'product';

  return (
    <div className="min-h-screen bg-base">
      <Header
        currentStep={STEP_NUMBER[step]}
        showStepper={step === 'result' || (!isCheckoutActive && screen === 'detail')}
        session={user ? { fullName: user.fullName, email: user.email } : null}
        onLogoClick={() => dispatch(goToCatalog())}
        onLoginClick={() => {
          dispatch(setAuthIntent('direct'));
          dispatch(goToLogin());
        }}
        onLogout={() => {
          dispatch(logout());
          dispatch(goToCatalog());
        }}
      />
      {toastMessage && <Toast message={toastMessage} />}
      <main>
        {step === 'result' && summary && result ? (
          <ResultScreen
            summary={summary}
            result={result}
            onRetry={() => dispatch(retryPayment())}
            onBackToStore={handleBackToStore}
          />
        ) : isCheckoutActive ? (
          // card-delivery/summary: the background stays the detail screen the purchase started from.
          selectedProductId ? (
            <DetailScreen productId={selectedProductId} onBack={() => dispatch(goToCatalog())} onPay={() => handlePay(selectedProductId)} />
          ) : (
            <CatalogScreen onSelectProduct={(productId) => dispatch(goToDetail(productId))} />
          )
        ) : screen === 'login' ? (
          <LoginScreen
            backLabel={typeof intent === 'object' && selectedProductId ? '‹ Producto' : '‹ Productos'}
            onBack={() => (typeof intent === 'object' && selectedProductId ? dispatch(goToDetail(selectedProductId)) : dispatch(goToCatalog()))}
            onNavigateToRegister={() => dispatch(goToRegister())}
            onSuccess={handleAuthSuccess}
          />
        ) : screen === 'register' ? (
          <RegisterScreen onNavigateToLogin={() => dispatch(goToLogin())} onSuccess={handleAuthSuccess} />
        ) : screen === 'detail' && selectedProductId ? (
          <DetailScreen
            productId={selectedProductId}
            onBack={() => dispatch(goToCatalog())}
            onPay={() => handlePay(selectedProductId)}
          />
        ) : (
          <CatalogScreen onSelectProduct={(productId) => dispatch(goToDetail(productId))} />
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
