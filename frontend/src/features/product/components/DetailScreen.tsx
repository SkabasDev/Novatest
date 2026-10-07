import { MapPin, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { setQuantity } from '../../checkout/checkoutSlice';
import { fetchProducts } from '../productSlice';
import { QuantityStepper } from './QuantityStepper';

interface DetailScreenProps {
  productId: string;
  onBack: () => void;
  onPay: () => void;
}

/** Product detail, parametrized by id — replaces the single-product vitrine (spec §11.4). */
export function DetailScreen({ productId, onBack, onPay }: DetailScreenProps) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.product);
  const quantity = useAppSelector((state) => state.checkout.quantity);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.user));

  useEffect(() => {
    // Guarded on 'idle' so remounting after checkout (back to the product screen) doesn't
    // clobber the client-side optimistic stock update with a stale re-fetch.
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  if (status === 'loading' || status === 'idle') {
    return <p className="p-6 text-center text-fg-3">Cargando producto…</p>;
  }

  if (status === 'failed') {
    return <p className="p-6 text-center text-danger">{error}</p>;
  }

  const product = items.find((item) => item.id === productId);

  if (!product) {
    return <p className="p-6 text-center text-fg-3">No encontramos este producto.</p>;
  }

  const isSoldOut = product.stock === 0;
  const stock = StockInfo(product.stock);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-6 pb-28 md:flex-row md:flex-wrap md:gap-10 md:pb-6">
      <button type="button" onClick={onBack} className="min-h-11 self-start text-[14px] font-medium text-primary md:basis-full">
        ‹ Productos
      </button>

      <div className="flex-1 basis-80">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] w-full rounded object-cover shadow-1 md:aspect-square"
        />
      </div>

      <div className="flex flex-1 basis-80 flex-col gap-4">
        <p className="font-mono text-overline uppercase text-fg-3">{product.category ?? 'PRODUCTO DESTACADO'}</p>
        <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">
          {product.name}
        </h1>
        <p className="text-[16px] text-fg-2">{product.description}</p>

        <div className="rounded bg-panel p-4 shadow-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-price font-bold text-fg-1 tabular">
              {formatCurrency(product.priceInCents)}
            </span>
            <span className="text-[13px] text-fg-3">{product.currency} · IVA incluido</span>
          </div>

          <div className={`mt-2 flex items-center gap-2 text-[14px] ${stock.colorClass}`}>
            <span className={`h-2 w-2 rounded-full ${stock.dotClass}`} />
            {stock.label}
          </div>

          <div className="my-4 border-t border-line" />

          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-fg-1">Cantidad</span>
            {!isSoldOut && (
              <QuantityStepper
                quantity={quantity}
                stock={product.stock}
                onChange={(next) => dispatch(setQuantity(Math.min(next, product.stock)))}
              />
            )}
          </div>

          {quantity >= 2 && !isSoldOut && (
            <div className="mt-3 flex items-center justify-between text-[14px]">
              <span className="text-fg-2">Subtotal ({quantity} unidades)</span>
              <span className="font-semibold text-fg-1 tabular">
                {formatCurrency(product.priceInCents * quantity)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <TrustLine icon={<ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />}>
            Pasarela de pago certificada. No guardamos tu CVC.
          </TrustLine>
          <TrustLine icon={<MapPin size={18} strokeWidth={1.75} aria-hidden="true" />}>
            Envío en 2–4 días hábiles.
          </TrustLine>
        </div>

        <div className="hidden md:mt-auto md:block">
          <Button onClick={onPay} disabled={isSoldOut}>
            {isSoldOut ? 'Agotado' : 'Pagar con tarjeta de crédito'}
          </Button>
          {!isAuthenticated && !isSoldOut && (
            <p className="mt-2 text-[13px] text-fg-3">Te pediremos iniciar sesión antes de pagar.</p>
          )}
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-base p-3 md:hidden">
        <Button onClick={onPay} disabled={isSoldOut}>
          {isSoldOut ? 'Agotado' : 'Pagar con tarjeta de crédito'}
        </Button>
        {!isAuthenticated && !isSoldOut && (
          <p className="mt-2 text-center text-[13px] text-fg-3">Te pediremos iniciar sesión antes de pagar.</p>
        )}
      </div>
    </div>
  );
}

function TrustLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[14px] text-fg-3">
      {icon}
      {children}
    </div>
  );
}

function StockInfo(stock: number): { label: string; colorClass: string; dotClass: string } {
  if (stock === 0) return { label: 'Agotado por ahora', colorClass: 'text-danger', dotClass: 'bg-danger' };
  if (stock <= 3) {
    return { label: `Quedan solo ${stock} unidades`, colorClass: 'text-warning', dotClass: 'bg-warning' };
  }
  return { label: `${stock} disponibles`, colorClass: 'text-success', dotClass: 'bg-success' };
}
