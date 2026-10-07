import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../../auth/authSlice';
import checkoutReducer from '../../checkout/checkoutSlice';
import { productApi } from '../productApi';
import productReducer from '../productSlice';
import { DetailScreen } from './DetailScreen';

jest.mock('../productApi');

const baseProduct = {
  id: 'p-1',
  name: 'Audífonos inalámbricos',
  description: 'desc',
  priceInCents: 150000,
  currency: 'COP',
  imageUrl: 'img.png',
};

function renderWithStore(options?: { authenticated?: boolean }) {
  const store = configureStore({
    reducer: { product: productReducer, checkout: checkoutReducer, auth: authReducer },
    preloadedState: options?.authenticated
      ? {
          auth: {
            user: { id: 'u-1', fullName: 'Jane', email: 'jane@example.com', phone: '3001234567', documentId: '123', defaultAddress: null, defaultCity: null },
            token: 'token',
            status: 'succeeded' as const,
            error: null,
            intent: 'direct' as const,
          },
        }
      : undefined,
  });
  return store;
}

describe('DetailScreen', () => {
  it('renders the matching product by id and calls onBack', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }, { ...baseProduct, id: 'p-2', name: 'Teclado', stock: 3 }]);
    const onBack = jest.fn();
    const store = renderWithStore();

    render(
      <Provider store={store}>
        <DetailScreen productId="p-2" onBack={onBack} onPay={jest.fn()} />
      </Provider>,
    );

    expect(await screen.findByText('Teclado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '‹ Productos' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows the session hint and calls onPay when not authenticated', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const onPay = jest.fn();
    const store = renderWithStore({ authenticated: false });

    render(
      <Provider store={store}>
        <DetailScreen productId="p-1" onBack={jest.fn()} onPay={onPay} />
      </Provider>,
    );

    await screen.findByText('Audífonos inalámbricos');
    expect(screen.getAllByText('Te pediremos iniciar sesión antes de pagar.').length).toBeGreaterThan(0);

    await userEvent.click(screen.getAllByRole('button', { name: /pagar con tarjeta/i })[0]);
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('hides the session hint when authenticated', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const store = renderWithStore({ authenticated: true });

    render(
      <Provider store={store}>
        <DetailScreen productId="p-1" onBack={jest.fn()} onPay={jest.fn()} />
      </Provider>,
    );

    await screen.findByText('Audífonos inalámbricos');
    expect(screen.queryByText('Te pediremos iniciar sesión antes de pagar.')).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown product id', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const store = renderWithStore();

    render(
      <Provider store={store}>
        <DetailScreen productId="missing" onBack={jest.fn()} onPay={jest.fn()} />
      </Provider>,
    );

    await waitFor(() => expect(screen.getByText('No encontramos este producto.')).toBeInTheDocument());
  });
});
