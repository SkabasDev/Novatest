import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { simulatePayment } from './paymentSimulator';
import { CardBrand } from './validators/cardBrand';

export type CheckoutStep = 'product' | 'card-delivery' | 'summary' | 'result';

export const STEP_NUMBER: Record<CheckoutStep, number> = {
  product: 1,
  'card-delivery': 2,
  summary: 3,
  result: 4,
};

/** Where this checkout came from — drives back-navigation and what gets cleared on approval (spec §12.5/§12.7). */
export type CheckoutSource = 'cart' | 'buy-now';

export interface DeliveryInfo {
  address: string;
  city: string;
  phone: string;
}

export interface CheckoutLine {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
}

export interface CheckoutSummary {
  lines: CheckoutLine[];
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  delivery: DeliveryInfo;
  cardLast4: string;
  cardBrand: CardBrand;
}

export function subtotalInCents(summary: Pick<CheckoutSummary, 'lines'>): number {
  return summary.lines.reduce((sum, line) => sum + line.unitPriceInCents * line.quantity, 0);
}

export function totalInCents(summary: CheckoutSummary): number {
  return subtotalInCents(summary) + summary.baseFeeInCents + summary.deliveryFeeInCents;
}

export interface PaymentResult {
  status: 'APPROVED' | 'DECLINED';
  transactionReference: string;
}

interface CheckoutState {
  step: CheckoutStep;
  source: CheckoutSource;
  /** Only set for "Comprar ahora" — the single product it bypasses the cart for (spec §12.7). */
  buyNowProductId: string | null;
  /** Detail page's quantity selector; also the quantity captured for "Comprar ahora". */
  quantity: number;
  summary: CheckoutSummary | null;
  paymentStatus: 'idle' | 'processing' | 'settled';
  result: PaymentResult | null;
}

const initialState: CheckoutState = {
  step: 'product',
  source: 'cart',
  buyNowProductId: null,
  quantity: 1,
  summary: null,
  paymentStatus: 'idle',
  result: null,
};

export const submitPayment = createAsyncThunk('checkout/submitPayment', async (cardNumber: string) =>
  simulatePayment(cardNumber),
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = Math.max(1, action.payload);
    },
    /** "Comprar ahora" — pays for a single product/quantity, skipping the cart entirely (spec §12.7). */
    startBuyNow(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      state.source = 'buy-now';
      state.buyNowProductId = action.payload.productId;
      state.quantity = action.payload.quantity;
      state.step = 'card-delivery';
    },
    /** Pays for everything currently in the cart (spec §12.1/§12.4). */
    startCartCheckout(state) {
      state.source = 'cart';
      state.buyNowProductId = null;
      state.step = 'card-delivery';
    },
    setCheckoutSummary(state, action: PayloadAction<CheckoutSummary>) {
      state.summary = action.payload;
      state.step = 'summary';
    },
    goToStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    /** "Reintentar pago": keeps the summary (so the screen can be pre-filled) and clears the outcome. */
    retryPayment(state) {
      state.step = 'card-delivery';
      state.paymentStatus = 'idle';
      state.result = null;
    },
    resetCheckout() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPayment.pending, (state) => {
        state.paymentStatus = 'processing';
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.paymentStatus = 'settled';
        state.result = action.payload;
        state.step = 'result';
      })
      .addCase(submitPayment.rejected, (state) => {
        state.paymentStatus = 'settled';
        state.result = { status: 'DECLINED', transactionReference: 'N/A' };
        state.step = 'result';
      });
  },
});

export const {
  setQuantity,
  startBuyNow,
  startCartCheckout,
  setCheckoutSummary,
  goToStep,
  retryPayment,
  resetCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
