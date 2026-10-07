import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartLine {
  productId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
}

const initialState: CartState = { lines: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Adds the quantity to the existing line, or creates a new one (spec §12.3). */
    addToCart(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const existing = state.lines.find((line) => line.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.lines.push({ productId, quantity });
      }
    },
    setLineQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const line = state.lines.find((l) => l.productId === action.payload.productId);
      if (line) line.quantity = Math.max(1, action.payload.quantity);
    },
    removeLine(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.productId !== action.payload);
    },
    clearCart(state) {
      state.lines = [];
    },
  },
});

export const { addToCart, setLineQuantity, removeLine, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
