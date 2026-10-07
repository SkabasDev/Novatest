import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { Header } from '../shared/ui/Header';
import { Toast } from '../shared/ui/Toast';
import { formatCurrency } from '../shared/utils/formatCurrency';
import { LoginScreen } from '../features/auth/components/LoginScreen';
import { PendingSummary } from '../features/auth/components/PendingPurchaseCard';
import { RegisterScreen } from '../features/auth/components/RegisterScreen';
import { logout, setAuthIntent } from '../features/auth/authSlice';
import { CartScreen } from '../features/cart/components/CartScreen';
import { clearCart } from '../features/cart/cartSlice';
import { CardDeliveryScreen } from '../features/checkout/components/CardDeliveryScreen';
import { ResultScreen } from '../features/checkout/components/ResultScreen';
import { SummaryScreen } from '../features/checkout/components/SummaryScreen';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../features/checkout/constants';
import {
  CheckoutLine,
  goToStep,
  resetCheckout,
  retryPayment,
  setCheckoutSummary,
  startBuyNow,
  startCartCheckout,
  STEP_NUMBER,
  submitPayment,
} from '../features/checkout/checkoutSlice';
import { detectCardBrand } from '../features/checkout/validators/cardBrand';
import { CheckoutFormValues } from '../features/checkout/validators/validateField';
import { goToCart, goToCatalog, goToDetail, goToLogin, goToRegister } from '../features/navigation/navigationSlice';
import { applyStockUpdate } from '../features/product/productSlice';
import { CatalogScreen } from '../features/product/components/CatalogScreen';
import { DetailScreen } from '../features/product/components/DetailScreen';

const TOAST_DURATION_MS = 6000;

/**
 * Top-level router. Catalog/Detail/Cart/Login/Register (free navigation, spec §11.1/§12.1) and
 * the payment flow (card-delivery/summary/result, full pages per spec §11.10-11.11) all render
 * as the single main screen, switched on `checkout.step`/`navigation.screen`. Session is only
 * required at "Pagar" — browsing, the cart and adding to it stay free.
 *
 * A checkout can come from the cart (multiple lines) or "Comprar ahora" (a single line,
 * bypassing the cart — spec §12.7); `checkout.source` tracks which, since back-navigation and
 * what gets cleared on approval differ between the two.
 *
 * Full card data (PAN/CVC) lives only in this component's state, in memory — it is never
 * dispatched to Redux/localStorage, so a page refresh can never resurrect it.
 */
export function CheckoutWizard() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const source = useAppSelector((state) => state.checkout.source);
  const buyNowProductId = useAppSelector((state) => state.checkout.buyNowProductId);
  const quantity = useAppSelector((state) => state.checkout.quantity);
  const summary = useAppSelector((state) => state.checkout.summary);
  const paymentStatus = useAppSelector((state) => state.checkout.paymentStatus);
  const result = useAppSelector((state) => state.checkout.result);
  const products = useAppSelector((state) => state.product.items);
  const cartLines = useAppSelector((state) => state.cart.lines);
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

  function showToast(message: string) {
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }

  /** The lines being paid for right now, derived from source + cart/buy-now selection. */
  function buildActiveLines(): CheckoutLine[] {
    if (source === 'buy-now') {
      const product = products.find((item) => item.id === buyNowProductId);
      return product
        ? [{ productId: product.id, productName: product.name, unitPriceInCents: product.priceInCents, quantity }]
        : [];
    }
    return cartLines
      .map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product
          ? { productId: product.id, productName: product.name, unitPriceInCents: product.priceInCents, quantity: line.quantity }
          : null;
      })
      .filter((line): line is CheckoutLine => line !== null);
  }

  function handleCardDeliverySubmit(values: CheckoutFormValues) {
    const lines = buildActiveLines();
    if (lines.length === 0) return;
    setCardValues(values);

    const digits = values.cardNumber.replace(/\D/g, '');
    dispatch(
      setCheckoutSummary({
        lines,
        baseFeeInCents: BASE_FEE_IN_CENTS,
        deliveryFeeInCents: DELIVERY_FEE_IN_CENTS,
        delivery: { address: values.address, city: values.city, phone: values.phone },
        cardLast4: digits.slice(-4),
        cardBrand: detectCardBrand(digits),
      }),
    );
  }

  function handleCardDeliveryBack() {
    dispatch(goToStep('product'));
    if (source === 'buy-now' && buyNowProductId) dispatch(goToDetail(buyNowProductId));
    else dispatch(goToCart());
  }

  /** Approved only: decrements stock, clears the cart for a cart checkout, and returns to the catalog. */
  function handleApprovedBack() {
    if (summary) {
      if (source === 'cart') {
        summary.lines.forEach((line) => {
          const product = products.find((item) => item.id === line.productId);
          if (product) dispatch(applyStockUpdate({ productId: product.id, stock: Math.max(0, product.stock - line.quantity) }));
        });
        dispatch(clearCart());
        showToast(`Compra confirmada. Actualizamos el stock de ${summary.lines.length} productos.`);
      } else {
        const line = summary.lines[0];
        const product = line ? products.find((item) => item.id === line.productId) : undefined;
        if (line && product) {
          const newStock = Math.max(0, product.stock - line.quantity);
          dispatch(applyStockUpdate({ productId: product.id, stock: newStock }));
          showToast(`Stock actualizado: quedan ${newStock} unidades.`);
        }
      }
    }
    setCardValues(null);
    dispatch(resetCheckout());
    dispatch(goToCatalog());
  }

  /** Declined only: nothing is cleared or decremented — just navigates back (spec §12.5/§12.7). */
  function handleDeclinedBack() {
    const wasCart = source === 'cart';
    const productId = buyNowProductId;
    setCardValues(null);
    dispatch(resetCheckout());
    if (wasCart) dispatch(goToCart());
    else if (productId) dispatch(goToDetail(productId));
    else dispatch(goToCatalog());
  }

  function handleBuyNow(productId: string, qty: number) {
    if (user) {
      dispatch(startBuyNow({ productId, quantity: qty }));
      return;
    }
    dispatch(setAuthIntent({ pendingProductId: productId }));
    dispatch(goToLogin());
  }

  function handleCartCheckout() {
    if (user) {
      dispatch(startCartCheckout());
      return;
    }
    dispatch(setAuthIntent('pendingCart'));
    dispatch(goToLogin());
  }

  function handleAuthSuccess() {
    if (typeof intent === 'object' && intent.pendingProductId) {
      const productId = intent.pendingProductId;
      dispatch(setAuthIntent('direct'));
      dispatch(startBuyNow({ productId, quantity }));
    } else if (intent === 'pendingCart') {
      dispatch(setAuthIntent('direct'));
      dispatch(startCartCheckout());
    } else {
      dispatch(goToCatalog());
    }
  }

  function buildPendingSummary(): PendingSummary | undefined {
    if (typeof intent === 'object' && intent.pendingProductId) {
      const product = products.find((item) => item.id === intent.pendingProductId);
      if (!product) return undefined;
      return { label: `${product.name} × ${quantity}`, subtotalInCents: product.priceInCents * quantity };
    }
    if (intent === 'pendingCart') {
      const subtotal = cartLines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return sum + (product ? product.priceInCents * line.quantity : 0);
      }, 0);
      return { label: `${cartLines.length} productos`, subtotalInCents: subtotal };
    }
    return undefined;
  }

  const isCheckoutActive = step !== 'product';
  const activeLines = buildActiveLines();
  const activeSubtotal = activeLines.reduce((sum, line) => sum + line.unitPriceInCents * line.quantity, 0);
  const cardDeliveryHeaderSummary =
    activeLines.length === 1
      ? `${activeLines[0].productName} × ${activeLines[0].quantity} · ${formatCurrency(activeSubtotal)}`
      : `${activeLines.length} productos · ${formatCurrency(activeSubtotal)}`;
  const cardDeliveryBackLabel = source === 'buy-now' ? `‹ ${activeLines[0]?.productName ?? 'Producto'}` : '‹ Carrito';
  const cartUnitCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="min-h-screen bg-base">
      <Header
        currentStep={STEP_NUMBER[step]}
        showStepper={isCheckoutActive || screen === 'detail'}
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
        cartCount={cartUnitCount}
        onCartClick={() => dispatch(goToCart())}
      />
      {toastMessage && <Toast message={toastMessage} />}
      <main>
        {step === 'result' && summary && result ? (
          <ResultScreen
            summary={summary}
            result={result}
            onRetry={() => dispatch(retryPayment())}
            onBackToStore={handleApprovedBack}
            onDeclinedBack={handleDeclinedBack}
            declinedBackLabel={source === 'cart' ? 'Volver al carrito' : 'Volver al producto'}
          />
        ) : step === 'summary' && summary ? (
          <SummaryScreen
            summary={summary}
            isProcessing={paymentStatus === 'processing'}
            onBack={() => dispatch(goToStep('card-delivery'))}
            onPay={() => cardValues && dispatch(submitPayment(cardValues.cardNumber))}
            onEditData={() => dispatch(goToStep('card-delivery'))}
          />
        ) : step === 'card-delivery' ? (
          activeLines.length > 0 ? (
            <CardDeliveryScreen
              backLabel={cardDeliveryBackLabel}
              headerSummary={cardDeliveryHeaderSummary}
              onBack={handleCardDeliveryBack}
              onSubmit={handleCardDeliverySubmit}
              initialValues={cardValues ?? undefined}
            />
          ) : (
            <CatalogScreen onSelectProduct={(productId) => dispatch(goToDetail(productId))} />
          )
        ) : screen === 'login' ? (
          <LoginScreen
            backLabel={typeof intent === 'object' ? '‹ Producto' : intent === 'pendingCart' ? '‹ Carrito' : '‹ Productos'}
            onBack={() => {
              if (typeof intent === 'object') dispatch(goToDetail(intent.pendingProductId));
              else if (intent === 'pendingCart') dispatch(goToCart());
              else dispatch(goToCatalog());
            }}
            onNavigateToRegister={() => dispatch(goToRegister())}
            onSuccess={handleAuthSuccess}
            pendingSummary={buildPendingSummary()}
          />
        ) : screen === 'register' ? (
          <RegisterScreen onNavigateToLogin={() => dispatch(goToLogin())} onSuccess={handleAuthSuccess} />
        ) : screen === 'cart' ? (
          <CartScreen
            onKeepShopping={() => dispatch(goToCatalog())}
            onViewProduct={(productId) => dispatch(goToDetail(productId))}
            onCheckout={handleCartCheckout}
            onRemoveLine={(productName) => showToast(`${productName} salió del carrito.`)}
          />
        ) : screen === 'detail' && selectedProductId ? (
          <DetailScreen
            productId={selectedProductId}
            onBack={() => dispatch(goToCatalog())}
            onBuyNow={handleBuyNow}
            onViewCart={() => dispatch(goToCart())}
            onAddedToCart={showToast}
          />
        ) : (
          <CatalogScreen onSelectProduct={(productId) => dispatch(goToDetail(productId))} />
        )}
      </main>
    </div>
  );
}
