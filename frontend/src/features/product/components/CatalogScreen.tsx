import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { ProductDto } from '../../../shared/types/api';
import { fetchProducts } from '../productSlice';

interface CatalogScreenProps {
  onSelectProduct: (productId: string) => void;
}

/** Product grid — replaces the single fixed product vitrine (spec §11.3). */
export function CatalogScreen({ onSelectProduct }: CatalogScreenProps) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.product);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  if (status === 'loading' || status === 'idle') {
    return <p className="p-6 text-center text-fg-3">Cargando productos…</p>;
  }

  if (status === 'failed') {
    return <p className="p-6 text-center text-danger">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-page px-4 py-6">
      <p className="font-mono text-overline uppercase text-fg-3">Tienda</p>
      <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">
        Productos
      </h1>

      {items.length === 0 ? (
        <p className="mt-6 text-center text-fg-3">No hay productos disponibles.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => onSelectProduct(product.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onClick }: { product: ProductDto; onClick: () => void }) {
  const stock = StockInfo(product.stock);
  const isSoldOut = product.stock === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded bg-panel text-left shadow-1 transition-colors hover:bg-inset"
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`aspect-square w-full object-cover ${isSoldOut ? 'opacity-50' : ''}`}
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-[15px] font-semibold text-fg-1">{product.name}</span>
        <span className="mt-auto font-display text-[18px] font-bold text-fg-1 tabular">
          {formatCurrency(product.priceInCents)}
        </span>
        <div className={`flex items-center gap-1.5 text-[13px] ${stock.colorClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${stock.dotClass}`} />
          {stock.label}
        </div>
      </div>
    </button>
  );
}

function StockInfo(stock: number): { label: string; colorClass: string; dotClass: string } {
  if (stock === 0) return { label: 'Agotado', colorClass: 'text-danger', dotClass: 'bg-danger' };
  if (stock <= 3) return { label: `Quedan ${stock}`, colorClass: 'text-warning', dotClass: 'bg-warning' };
  return { label: `${stock} disponibles`, colorClass: 'text-success', dotClass: 'bg-success' };
}
