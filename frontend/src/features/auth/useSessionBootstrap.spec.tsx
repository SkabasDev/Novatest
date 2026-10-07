import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import authReducer from './authSlice';
import { authApi } from './authApi';
import { useSessionBootstrap } from './useSessionBootstrap';

jest.mock('./authApi');

function TestComponent() {
  useSessionBootstrap();
  return null;
}

describe('useSessionBootstrap', () => {
  it('does nothing when there is no persisted token', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    expect(authApi.fetchProfile).not.toHaveBeenCalled();
  });

  it('revalidates a persisted token against the backend', async () => {
    (authApi.fetchProfile as jest.Mock).mockResolvedValue({
      id: 'u-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '3001234567',
      documentId: '1234567890',
      defaultAddress: null,
      defaultCity: null,
    });

    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user: null, token: 'stale-token', status: 'idle' as const, error: null, intent: 'direct' as const } },
    });

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    await waitFor(() => expect(authApi.fetchProfile).toHaveBeenCalledWith('stale-token'));
    await waitFor(() => expect(store.getState().auth.user?.fullName).toBe('Jane Doe'));
  });

  it('drops the session when the persisted token is rejected', async () => {
    (authApi.fetchProfile as jest.Mock).mockRejectedValue(new Error('401'));

    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user: null, token: 'expired-token', status: 'idle' as const, error: null, intent: 'direct' as const } },
    });

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    await waitFor(() => expect(store.getState().auth.token).toBeNull());
  });
});
