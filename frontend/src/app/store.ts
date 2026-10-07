import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * Feature slices are added to this root reducer incrementally, one per feature PR
 * (product, then checkout, then transaction) — see FRONTEND.md for the target shape.
 */
const rootReducer = combineReducers({});

const persistConfig = {
  key: 'nova-checkout',
  storage,
  // Never persist raw card data — only non-sensitive checkout metadata will be whitelisted here.
  whitelist: [] as string[],
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
