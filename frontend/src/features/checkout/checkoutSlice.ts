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

export interface DeliveryInfo {
  address: string;
  city: string;
  phone: string;
}

export interface CheckoutSummary {
  productName: string;
  unitPriceInCents: number;
  quantity: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  delivery: DeliveryInfo;
  cardLast4: string;
  cardBrand: CardBrand;
}

export interface PaymentResult {
  status: 'APPROVED' | 'DECLINED';
  transactionReference: string;
}

interface CheckoutState {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
  summary: CheckoutSummary | null;
  paymentStatus: 'idle' | 'processing' | 'settled';
  result: PaymentResult | null;
}

const initialState: CheckoutState = {
  step: 'product',
  productId: null,
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
    startCheckout(state, action: PayloadAction<string>) {
      state.productId = action.payload;
      state.step = 'card-delivery';
    },
    setCheckoutSummary(state, action: PayloadAction<CheckoutSummary>) {
      state.summary = action.payload;
      state.step = 'summary';
    },
    goToStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
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

export const { setQuantity, startCheckout, setCheckoutSummary, goToStep, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
