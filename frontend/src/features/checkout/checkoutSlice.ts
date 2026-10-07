import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CheckoutStep = 'product' | 'card-delivery' | 'summary' | 'result';

export const STEP_NUMBER: Record<CheckoutStep, number> = {
  product: 1,
  'card-delivery': 2,
  summary: 3,
  result: 4,
};

interface CheckoutState {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
}

const initialState: CheckoutState = {
  step: 'product',
  productId: null,
  quantity: 1,
};

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
    goToStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    resetCheckout() {
      return initialState;
    },
  },
});

export const { setQuantity, startCheckout, goToStep, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
