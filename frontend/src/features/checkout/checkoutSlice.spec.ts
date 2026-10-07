import checkoutReducer, { goToStep, resetCheckout, setQuantity, startCheckout } from './checkoutSlice';

describe('checkoutSlice', () => {
  it('returns the initial state', () => {
    expect(checkoutReducer(undefined, { type: 'unknown' })).toEqual({ step: 'product', productId: null, quantity: 1 });
  });

  it('moves to card-delivery and stores the product id when checkout starts', () => {
    const state = checkoutReducer(undefined, startCheckout('p-1'));
    expect(state.step).toBe('card-delivery');
    expect(state.productId).toBe('p-1');
  });

  it('clamps quantity to a minimum of 1', () => {
    const state = checkoutReducer(undefined, setQuantity(0));
    expect(state.quantity).toBe(1);
  });

  it('updates quantity', () => {
    const state = checkoutReducer(undefined, setQuantity(3));
    expect(state.quantity).toBe(3);
  });

  it('allows navigating directly between steps', () => {
    const state = checkoutReducer(undefined, goToStep('summary'));
    expect(state.step).toBe('summary');
  });

  it('resets to the initial state', () => {
    const dirty = checkoutReducer(undefined, startCheckout('p-1'));
    const state = checkoutReducer(dirty, resetCheckout());
    expect(state).toEqual({ step: 'product', productId: null, quantity: 1 });
  });
});
