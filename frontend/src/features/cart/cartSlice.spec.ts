import cartReducer, { addToCart, clearCart, removeLine, setLineQuantity } from './cartSlice';

describe('cartSlice', () => {
  it('returns the initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual({ lines: [] });
  });

  it('adds a new line', () => {
    const state = cartReducer(undefined, addToCart({ productId: 'p-1', quantity: 2 }));
    expect(state.lines).toEqual([{ productId: 'p-1', quantity: 2 }]);
  });

  it('sums the quantity when the line already exists', () => {
    const first = cartReducer(undefined, addToCart({ productId: 'p-1', quantity: 2 }));
    const state = cartReducer(first, addToCart({ productId: 'p-1', quantity: 3 }));
    expect(state.lines).toEqual([{ productId: 'p-1', quantity: 5 }]);
  });

  it('sets a line quantity directly, clamped to a minimum of 1', () => {
    const withLine = cartReducer(undefined, addToCart({ productId: 'p-1', quantity: 2 }));
    const state = cartReducer(withLine, setLineQuantity({ productId: 'p-1', quantity: 0 }));
    expect(state.lines[0].quantity).toBe(1);
  });

  it('removes a line', () => {
    const withLine = cartReducer(undefined, addToCart({ productId: 'p-1', quantity: 2 }));
    const state = cartReducer(withLine, removeLine('p-1'));
    expect(state.lines).toEqual([]);
  });

  it('clears the cart', () => {
    const withLines = cartReducer(
      cartReducer(undefined, addToCart({ productId: 'p-1', quantity: 2 })),
      addToCart({ productId: 'p-2', quantity: 1 }),
    );
    const state = cartReducer(withLines, clearCart());
    expect(state.lines).toEqual([]);
  });
});
