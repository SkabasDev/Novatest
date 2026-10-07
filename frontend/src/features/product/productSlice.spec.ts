import productReducer, { applyStockUpdate, fetchProducts } from './productSlice';
import { ProductDto } from '../../shared/types/api';

const product: ProductDto = {
  id: 'p-1',
  name: 'Audífonos inalámbricos',
  description: 'desc',
  priceInCents: 1000,
  currency: 'COP',
  stock: 5,
  imageUrl: 'img.png',
};

describe('productSlice', () => {
  it('returns the initial state', () => {
    expect(productReducer(undefined, { type: 'unknown' })).toEqual({ items: [], status: 'idle', error: null });
  });

  it('sets status to loading on fetchProducts.pending', () => {
    const state = productReducer(undefined, fetchProducts.pending('req-1', undefined));
    expect(state.status).toBe('loading');
  });

  it('stores the products on fetchProducts.fulfilled', () => {
    const state = productReducer(undefined, fetchProducts.fulfilled([product], 'req-1', undefined));
    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(1);
  });

  it('stores the error message on fetchProducts.rejected', () => {
    const action = fetchProducts.rejected(new Error('network down'), 'req-1', undefined);
    const state = productReducer(undefined, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('network down');
  });

  it('updates the stock of a product via applyStockUpdate', () => {
    const initial = productReducer(undefined, fetchProducts.fulfilled([product], 'req-1', undefined));
    const state = productReducer(initial, applyStockUpdate({ productId: 'p-1', stock: 3 }));
    expect(state.items[0].stock).toBe(3);
  });
});
