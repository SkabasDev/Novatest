import { ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../../checkout/constants';
import { fetchProducts } from '../../product/productSlice';
import { removeLine, setLineQuantity } from '../cartSlice';
import { QuantityStepper } from '../../product/components/QuantityStepper';

interface CartScreenProps {
  onKeepShopping: () => void;
  onViewProduct: (productId: string) => void;
  onCheckout: () => void;
  onRemoveLine: (productName: string) => void;
}

/** "Carrito" as a full page, step 1 of the flow (spec §12.4). */
export function CartScreen({ onKeepShopping, onViewProduct, onCheckout, onRemoveLine }: CartScreenProps) {
  const dispatch = useAppDispatch();
  const cartLines = useAppSelector((state) => state.cart.lines);
  const { items, status } = useAppSelector((state) => state.product);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.user));

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  const lines = cartLines
    .map((line) => {
      const product = items.find((item) => item.id === line.productId);
      return product ? { ...line, product } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-sheet flex-col items-center gap-4 px-4 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-inset">
          <ShoppingCart size={24} strokeWidth={1.75} className="text-fg-3" aria-hidden="true" />
        </span>
        <h1 className="font-display text-[20px] font-semibold text-fg-1">Tu carrito está vacío</h1>
        <p className="text-[14px] text-fg-3">Agrega productos desde la tienda y págalos todos juntos.</p>
        <Button onClick={onKeepShopping}>Ver productos</Button>
      </div>
    );
  }

  const subtotalInCents = lines.reduce((sum, line) => sum + line.product.priceInCents * line.quantity, 0);
  const totalInCents = subtotalInCents + BASE_FEE_IN_CENTS + DELIVERY_FEE_IN_CENTS;

  return (
    <div className="mx-auto flex max-w-sheet flex-col gap-6 px-4 py-6 pb-28 md:pb-6">
      <button type="button" onClick={onKeepShopping} className="min-h-11 self-start text-[14px] font-medium text-primary">
        ‹ Seguir comprando
      </button>

      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">Carrito</h1>
        <span className="text-[14px] text-fg-3">{lines.length} productos</span>
      </div>

      <div className="flex flex-col divide-y divide-line rounded bg-panel shadow-1">
        {lines.map(({ productId, quantity, product }) => {
          const atStockLimit = quantity >= product.stock;
          return (
            <div key={productId} className="grid gap-3 p-4" style={{ gridTemplateColumns: '72px 1fr' }}>
              <button type="button" onClick={() => onViewProduct(productId)}>
                <img src={product.imageUrl} alt="" className="h-[72px] w-[72px] rounded object-cover" />
              </button>
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onViewProduct(productId)}
                      className="truncate text-left text-[15px] font-semibold text-fg-1 hover:underline"
                    >
                      {product.name}
                    </button>
                    <p className="text-[13px] text-fg-3">{formatCurrency(product.priceInCents)} c/u</p>
                  </div>
                  <span className="shrink-0 font-display text-[16px] font-bold text-fg-1 tabular">
                    {formatCurrency(product.priceInCents * quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    quantity={quantity}
                    stock={product.stock}
                    onChange={(next) => dispatch(setLineQuantity({ productId, quantity: next }))}
                  />
                  <button
                    type="button"
                    aria-label={`Eliminar ${product.name} del carrito`}
                    onClick={() => {
                      dispatch(removeLine(productId));
                      onRemoveLine(product.name);
                    }}
                    className="flex h-11 w-11 items-center justify-center text-fg-3 hover:text-danger"
                  >
                    <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
                {atStockLimit && (
                  <p className="text-[13px] text-warning">Llevas todas las unidades disponibles ({product.stock}).</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 rounded bg-panel p-4 text-[15px] shadow-1">
        <Row label="Subtotal" value={formatCurrency(subtotalInCents)} />
        <Row label="Tarifa base" value={formatCurrency(BASE_FEE_IN_CENTS)} />
        <Row label="Envío" value={formatCurrency(DELIVERY_FEE_IN_CENTS)} />
        <div className="my-1 border-t border-line" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-fg-1">Total</span>
          <span className="font-display text-[24px] font-bold text-fg-1 tabular">{formatCurrency(totalInCents)}</span>
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-base p-3 md:static md:border-0 md:p-0">
        <Button onClick={onCheckout}>Pagar con tarjeta de crédito</Button>
        {!isAuthenticated && (
          <p className="mt-2 text-center text-[13px] text-fg-3">Te pediremos iniciar sesión antes de pagar.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-2">{label}</span>
      <span className="tabular text-fg-1">{value}</span>
    </div>
  );
}
