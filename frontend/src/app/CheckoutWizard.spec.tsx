import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { CheckoutWizard } from './CheckoutWizard';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import cartReducer from '../features/cart/cartSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import navigationReducer from '../features/navigation/navigationSlice';
import { productApi } from '../features/product/productApi';
import productReducer from '../features/product/productSlice';

jest.mock('../features/product/productApi');
jest.mock('../features/auth/authApi');

function renderWizard() {
  const store = configureStore({
    reducer: { product: productReducer, checkout: checkoutReducer, auth: authReducer, navigation: navigationReducer, cart: cartReducer },
  });
  render(
    <Provider store={store}>
      <CheckoutWizard />
    </Provider>,
  );
  return store;
}

async function signIn() {
  await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

async function goFromCatalogToBuyNowCardDelivery() {
  await screen.findByText('Audífonos inalámbricos');
  await userEvent.click(screen.getByText('Audífonos inalámbricos'));

  await userEvent.click(screen.getAllByRole('button', { name: 'Comprar ahora' })[0]);

  // No session yet — lands on Login; sign in to continue to card/delivery.
  await signIn();

  await screen.findByText('Tarjeta y entrega');
}

async function addToCartAndOpenCart() {
  await screen.findByText('Audífonos inalámbricos');
  await userEvent.click(screen.getByText('Audífonos inalámbricos'));
  await userEvent.click(screen.getAllByRole('button', { name: /agregar al carrito/i })[0]);

  await userEvent.click(screen.getAllByRole('button', { name: /ver carrito/i })[0]);
  await screen.findByText('Carrito');
}

async function fillCardAndDeliveryForm(cardNumber: string) {
  await userEvent.type(screen.getByLabelText('Número de tarjeta', { exact: false }), cardNumber);
  // Cardholder and celular come prefilled from the session (Jane Doe / 3001234567) — clear first.
  await userEvent.clear(screen.getByLabelText('Nombre del titular'));
  await userEvent.type(screen.getByLabelText('Nombre del titular'), 'Jane Doe');
  await userEvent.type(screen.getByLabelText('Vencimiento'), '1229');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 123 #45-67, apto 8');
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogotá');
  await userEvent.clear(screen.getByLabelText('Celular'));
  await userEvent.type(screen.getByLabelText('Celular'), '3001234567');
}

async function payFromCardDelivery(cardNumber: string) {
  await fillCardAndDeliveryForm(cardNumber);
  await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));
  await screen.findByText('Resumen de pago');
  await userEvent.click(screen.getByRole('button', { name: /pagar \$/i }));
}

describe('CheckoutWizard (integration)', () => {
  beforeEach(() => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([
      {
        id: 'p-1',
        name: 'Audífonos inalámbricos',
        description: 'desc',
        priceInCents: 150_000_00,
        currency: 'COP',
        stock: 5,
        imageUrl: 'img.png',
      },
    ]);
    (authApi.login as jest.Mock).mockResolvedValue({
      token: 'signed-token',
      user: { id: 'u-1', fullName: 'Jane Doe', email: 'jane@example.com', phone: '3001234567', documentId: '123', defaultAddress: null, defaultCity: null },
    });
  });

  it('browses the catalog and detail without a session', async () => {
    renderWizard();

    expect(await screen.findByText('Productos')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Audífonos inalámbricos'));

    expect((await screen.findAllByText('Te pediremos iniciar sesión antes de pagar.')).length).toBeGreaterThan(0);
  });

  it('completes the "Comprar ahora" flow end to end on an approved payment, bypassing the cart', async () => {
    renderWizard();
    await goFromCatalogToBuyNowCardDelivery();

    await payFromCardDelivery('4242424242424242'); // valid, even last digit → simulated approval

    expect(screen.getByText('Procesando pago…')).toBeInTheDocument();
    expect(await screen.findByText('Pago aprobado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver a la tienda' }));

    expect(await screen.findByText('Stock actualizado: quedan 4 unidades.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Audífonos inalámbricos'));
    await waitFor(() => expect(screen.getByText('4 disponibles')).toBeInTheDocument());
  }, 15000);

  it('allows retrying with the summary kept after a declined "Comprar ahora" payment', async () => {
    renderWizard();
    await goFromCatalogToBuyNowCardDelivery();

    await payFromCardDelivery('4111111111111111'); // valid, odd last digit → simulated decline

    expect(await screen.findByText('Pago rechazado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar pago' }));

    expect(await screen.findByText('Tarjeta y entrega')).toBeInTheDocument();
    expect(screen.getByLabelText('CVC')).toHaveValue('');
    expect(screen.getByLabelText('Nombre del titular')).toHaveValue('Jane Doe');
  }, 15000);

  it('declines a "Comprar ahora" payment and returns to the product, untouched, on "Volver al producto"', async () => {
    renderWizard();
    await goFromCatalogToBuyNowCardDelivery();

    await payFromCardDelivery('4111111111111111');
    expect(await screen.findByText('Pago rechazado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver al producto' }));

    await screen.findByText('Audífonos inalámbricos');
    await waitFor(() => expect(screen.getByText('5 disponibles')).toBeInTheDocument());
  }, 15000);

  it('adds a product to the cart, pays from the Cart screen, and clears the cart with a combined stock toast on approval', async () => {
    renderWizard();
    await addToCartAndOpenCart();

    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));
    await signIn();

    await screen.findByText('Tarjeta y entrega');
    expect(screen.getByRole('button', { name: '‹ Carrito' })).toBeInTheDocument();

    await payFromCardDelivery('4242424242424242');
    expect(await screen.findByText('Pago aprobado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver a la tienda' }));

    expect(await screen.findByText('Compra confirmada. Actualizamos el stock de 1 productos.')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Audífonos inalámbricos'));
    await waitFor(() => expect(screen.getByText('4 disponibles')).toBeInTheDocument());
    expect(screen.queryAllByRole('button', { name: /ver carrito/i }).length).toBe(0);
  }, 15000);

  it('declines a cart checkout and returns to the untouched Cart on "Volver al carrito"', async () => {
    renderWizard();
    await addToCartAndOpenCart();

    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));
    await signIn();
    await screen.findByText('Tarjeta y entrega');

    await payFromCardDelivery('4111111111111111');
    expect(await screen.findByText('Pago rechazado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver al carrito' }));

    await screen.findByText('Carrito');
    expect(screen.getByText('1 productos')).toBeInTheDocument();
  }, 15000);
});
