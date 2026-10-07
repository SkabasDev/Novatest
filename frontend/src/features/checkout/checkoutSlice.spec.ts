import checkoutReducer, {
  CheckoutSummary,
  goToStep,
  resetCheckout,
  retryPayment,
  setCheckoutSummary,
  setQuantity,
  startCheckout,
  submitPayment,
} from './checkoutSlice';

const summary: CheckoutSummary = {
  productName: 'Audífonos',
  unitPriceInCents: 150000,
  quantity: 1,
  baseFeeInCents: 300000,
  deliveryFeeInCents: 1200000,
  delivery: { address: 'Calle 1', city: 'Bogotá', phone: '3001234567' },
  cardLast4: '4242',
  cardBrand: 'VISA',
};

describe('checkoutSlice', () => {
  it('returns the initial state', () => {
    expect(checkoutReducer(undefined, { type: 'unknown' })).toEqual({
      step: 'product',
      productId: null,
      quantity: 1,
      summary: null,
      paymentStatus: 'idle',
      result: null,
    });
  });

  it('moves to card-delivery and stores the product id when checkout starts', () => {
    const state = checkoutReducer(undefined, startCheckout('p-1'));
    expect(state.step).toBe('card-delivery');
    expect(state.productId).toBe('p-1');
  });

  it('clamps quantity to a minimum of 1', () => {
    expect(checkoutReducer(undefined, setQuantity(0)).quantity).toBe(1);
  });

  it('moves to summary and stores the summary data', () => {
    const state = checkoutReducer(undefined, setCheckoutSummary(summary));
    expect(state.step).toBe('summary');
    expect(state.summary).toEqual(summary);
  });

  it('sets paymentStatus to processing while the payment is in flight', () => {
    const state = checkoutReducer(undefined, submitPayment.pending('req-1', '4242'));
    expect(state.paymentStatus).toBe('processing');
  });

  it('moves to the result step and stores the outcome once the payment settles', () => {
    const action = submitPayment.fulfilled({ status: 'APPROVED', transactionReference: 'SIM-1' }, 'req-1', '4242');
    const state = checkoutReducer(undefined, action);
    expect(state.step).toBe('result');
    expect(state.paymentStatus).toBe('settled');
    expect(state.result).toEqual({ status: 'APPROVED', transactionReference: 'SIM-1' });
  });

  it('returns to card-delivery with a clean payment status on retry, keeping the summary', () => {
    const settled = checkoutReducer(
      checkoutReducer(undefined, setCheckoutSummary(summary)),
      submitPayment.fulfilled({ status: 'DECLINED', transactionReference: 'SIM-1' }, 'req-1', '4242'),
    );
    const state = checkoutReducer(settled, retryPayment());
    expect(state.step).toBe('card-delivery');
    expect(state.paymentStatus).toBe('idle');
    expect(state.result).toBeNull();
    expect(state.summary).toEqual(summary);
  });

  it('allows navigating directly between steps', () => {
    expect(checkoutReducer(undefined, goToStep('summary')).step).toBe('summary');
  });

  it('resets to the initial state', () => {
    const dirty = checkoutReducer(undefined, startCheckout('p-1'));
    const state = checkoutReducer(dirty, resetCheckout());
    expect(state.step).toBe('product');
    expect(state.productId).toBeNull();
  });
});
