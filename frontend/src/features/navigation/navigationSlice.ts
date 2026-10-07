import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Screen = 'catalog' | 'detail' | 'login' | 'register' | 'cart';

interface NavigationState {
  screen: Screen;
  selectedProductId: string | null;
}

const initialState: NavigationState = {
  screen: 'catalog',
  selectedProductId: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    goToCatalog(state) {
      state.screen = 'catalog';
    },
    goToDetail(state, action: PayloadAction<string>) {
      state.screen = 'detail';
      state.selectedProductId = action.payload;
    },
    goToLogin(state) {
      state.screen = 'login';
    },
    goToRegister(state) {
      state.screen = 'register';
    },
    goToCart(state) {
      state.screen = 'cart';
    },
  },
});

export const { goToCatalog, goToDetail, goToLogin, goToRegister, goToCart } = navigationSlice.actions;
export default navigationSlice.reducer;
