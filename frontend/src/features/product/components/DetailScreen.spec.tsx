import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../../auth/authSlice';
import cartReducer from '../../cart/cartSlice';
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

function buildStore(options?: { authenticated?: boolean; cart?: { productId: string; quantity: number }[] }) {
  return configureStore({
    reducer: { product: productReducer, checkout: checkoutReducer, auth: authReducer, cart: cartReducer },
    preloadedState: {
      auth: {
        user: options?.authenticated
          ? { id: 'u-1', fullName: 'Jane', email: 'jane@example.com', phone: '3001234567', documentId: '123', defaultAddress: null, defaultCity: null }
          : null,
        token: options?.authenticated ? 'token' : null,
        status: 'idle' as const,
        error: null,
        intent: 'direct' as const,
      },
      cart: { lines: options?.cart ?? [] },
    },
  });
}

function renderScreen(store: ReturnType<typeof buildStore>, overrides: Partial<Parameters<typeof DetailScreen>[0]> = {}) {
  render(
    <Provider store={store}>
      <DetailScreen
        productId="p-1"
        onBack={jest.fn()}
        onBuyNow={jest.fn()}
        onViewCart={jest.fn()}
        onAddedToCart={jest.fn()}
        {...overrides}
      />
    </Provider>,
  );
}

describe('DetailScreen', () => {
  it('renders the matching product by id and calls onBack', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }, { ...baseProduct, id: 'p-2', name: 'Teclado', stock: 3 }]);
    const onBack = jest.fn();
    const store = buildStore();

    render(
      <Provider store={store}>
        <DetailScreen productId="p-2" onBack={onBack} onBuyNow={jest.fn()} onViewCart={jest.fn()} onAddedToCart={jest.fn()} />
      </Provider>,
    );

    expect(await screen.findByText('Teclado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '‹ Productos' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows the session hint and calls onBuyNow with the selected quantity', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const onBuyNow = jest.fn();
    renderScreen(buildStore({ authenticated: false }), { onBuyNow });

    await screen.findByText('Audífonos inalámbricos');
    expect(screen.getAllByText('Te pediremos iniciar sesión antes de pagar.').length).toBeGreaterThan(0);

    await userEvent.click(screen.getAllByRole('button', { name: /comprar ahora/i })[0]);
    expect(onBuyNow).toHaveBeenCalledWith('p-1', 1);
  });

  it('adds to the cart, shows the toast message and resets the quantity selector', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const onAddedToCart = jest.fn();
    const store = buildStore();
    renderScreen(store, { onAddedToCart });

    await screen.findByText('Audífonos inalámbricos');
    await userEvent.click(screen.getAllByRole('button', { name: 'Aumentar cantidad' })[0]);
    await userEvent.click(screen.getAllByRole('button', { name: /agregar al carrito/i })[0]);

    expect(onAddedToCart).toHaveBeenCalledWith('Agregado al carrito: Audífonos inalámbricos × 2.');
    expect(store.getState().cart.lines).toEqual([{ productId: 'p-1', quantity: 2 }]);
    await waitFor(() => expect(screen.getAllByText('1').length).toBeGreaterThan(0));
  });

  it('shows "Ver carrito (N)" once the cart has units, and navigates on click', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    const onViewCart = jest.fn();
    renderScreen(buildStore({ cart: [{ productId: 'p-2', quantity: 3 }] }), { onViewCart });

    const links = await screen.findAllByRole('button', { name: 'Ver carrito (3)' });
    await userEvent.click(links[0]);
    expect(onViewCart).toHaveBeenCalledTimes(1);
  });

  it('caps the quantity selector at stock minus what is already in the cart, and shows "Ya en tu carrito" when exhausted', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 3 }]);
    renderScreen(buildStore({ cart: [{ productId: 'p-1', quantity: 3 }] }));

    await screen.findByText('Audífonos inalámbricos');
    expect(screen.getAllByRole('button', { name: /ya en tu carrito/i })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /comprar ahora/i })[0]).toBeDisabled();
    expect(screen.getByText('Llevas todas las unidades disponibles (3).')).toBeInTheDocument();
    expect(screen.queryByLabelText('Aumentar cantidad')).not.toBeInTheDocument();
  });

  it('shows "Agotado" and disables both CTAs when there is no stock at all', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 0 }]);
    renderScreen(buildStore());

    await screen.findByText('Agotado por ahora');
    screen.getAllByRole('button', { name: 'Agotado' }).forEach((button) => expect(button).toBeDisabled());
  });

  it('shows a not-found message for an unknown product id', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);
    render(
      <Provider store={buildStore()}>
        <DetailScreen productId="missing" onBack={jest.fn()} onBuyNow={jest.fn()} onViewCart={jest.fn()} onAddedToCart={jest.fn()} />
      </Provider>,
    );

    await waitFor(() => expect(screen.getByText('No encontramos este producto.')).toBeInTheDocument());
  });
});
