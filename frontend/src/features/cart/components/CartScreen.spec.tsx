import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../../auth/authSlice';
import cartReducer from '../cartSlice';
import { productApi } from '../../product/productApi';
import productReducer from '../../product/productSlice';
import { CartScreen } from './CartScreen';

jest.mock('../../product/productApi');

const products = [
  { id: 'p-1', name: 'Audífonos', description: 'd', priceInCents: 150000, currency: 'COP', stock: 5, imageUrl: 'img1.png' },
  { id: 'p-2', name: 'Teclado', description: 'd', priceInCents: 90000, currency: 'COP', stock: 2, imageUrl: 'img2.png' },
];

function buildStore(lines: { productId: string; quantity: number }[]) {
  return configureStore({
    reducer: { product: productReducer, cart: cartReducer, auth: authReducer },
    preloadedState: {
      cart: { lines },
      auth: { user: null, token: null, status: 'idle' as const, error: null, intent: 'direct' as const },
    },
  });
}

function renderScreen(lines: { productId: string; quantity: number }[], overrides: Partial<Parameters<typeof CartScreen>[0]> = {}) {
  (productApi.fetchAll as jest.Mock).mockResolvedValue(products);
  render(
    <Provider store={buildStore(lines)}>
      <CartScreen onKeepShopping={jest.fn()} onViewProduct={jest.fn()} onCheckout={jest.fn()} onRemoveLine={jest.fn()} {...overrides} />
    </Provider>,
  );
}

describe('CartScreen', () => {
  it('shows the empty state and navigates to the catalog', async () => {
    const onKeepShopping = jest.fn();
    renderScreen([], { onKeepShopping });

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver productos' }));
    expect(onKeepShopping).toHaveBeenCalledTimes(1);
  });

  it('renders one row per line with its line total, and the order totals', async () => {
    renderScreen([
      { productId: 'p-1', quantity: 2 },
      { productId: 'p-2', quantity: 1 },
    ]);

    expect(await screen.findByText('2 productos')).toBeInTheDocument();
    expect(screen.getByText('Audífonos')).toBeInTheDocument();
    expect(screen.getByText('Teclado')).toBeInTheDocument();
    // subtotal = 150000*2 + 90000*1 = 390000 cents -> $ 3.900
    expect(screen.getByText('$ 3.900')).toBeInTheDocument();
  });

  it('shows the stock-limit note when a line is at its max quantity', async () => {
    renderScreen([{ productId: 'p-2', quantity: 2 }]);
    expect(await screen.findByText('Llevas todas las unidades disponibles (2).')).toBeInTheDocument();
  });

  it('removes a line and calls onRemoveLine with the product name', async () => {
    const onRemoveLine = jest.fn();
    const store = buildStore([{ productId: 'p-1', quantity: 1 }]);
    (productApi.fetchAll as jest.Mock).mockResolvedValue(products);
    render(
      <Provider store={store}>
        <CartScreen onKeepShopping={jest.fn()} onViewProduct={jest.fn()} onCheckout={jest.fn()} onRemoveLine={onRemoveLine} />
      </Provider>,
    );

    await screen.findByText('Audífonos');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Audífonos del carrito' }));

    expect(onRemoveLine).toHaveBeenCalledWith('Audífonos');
    expect(store.getState().cart.lines).toEqual([]);
  });

  it('calls onViewProduct when a line is clicked', async () => {
    const onViewProduct = jest.fn();
    renderScreen([{ productId: 'p-1', quantity: 1 }], { onViewProduct });

    await userEvent.click(await screen.findByText('Audífonos'));
    expect(onViewProduct).toHaveBeenCalledWith('p-1');
  });

  it('shows the session hint and calls onCheckout', async () => {
    const onCheckout = jest.fn();
    renderScreen([{ productId: 'p-1', quantity: 1 }], { onCheckout });

    expect(await screen.findByText('Te pediremos iniciar sesión antes de pagar.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });
});
