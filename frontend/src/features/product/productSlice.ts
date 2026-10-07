import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ProductDto } from '../../shared/types/api';
import { productApi } from './productApi';

interface ProductState {
  items: ProductDto[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('product/fetchProducts', async () => productApi.fetchAll());

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    applyStockUpdate(state, action: { payload: { productId: string; stock: number } }) {
      const product = state.items.find((item) => item.id === action.payload.productId);
      if (product) {
        product.stock = action.payload.stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'No pudimos cargar el producto.';
      });
  },
});

export const { applyStockUpdate } = productSlice.actions;
export default productSlice.reducer;
