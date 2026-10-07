import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import productReducer from '../features/product/productSlice';

/**
 * Feature slices are added to this root reducer incrementally, one per feature PR —
 * see FRONTEND.md for the target shape.
 */
const rootReducer = combineReducers({
  product: productReducer,
  checkout: checkoutReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'nova-checkout',
  storage,
  // Never persist raw card data. The JWT is persisted (spec v2 §11.1: "en producción: JWT") so a
  // refresh doesn't log the user out — it's always revalidated against GET /auth/me on boot
  // (never trusted blindly), same pattern already used for pending transactions.
  whitelist: ['checkout', 'auth'] as string[],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
