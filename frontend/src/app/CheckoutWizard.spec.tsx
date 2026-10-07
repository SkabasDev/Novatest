import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { CheckoutWizard } from './CheckoutWizard';
import checkoutReducer from '../features/checkout/checkoutSlice';
import { productApi } from '../features/product/productApi';
import productReducer from '../features/product/productSlice';

jest.mock('../features/product/productApi');

function renderWizard() {
  const store = configureStore({ reducer: { product: productReducer, checkout: checkoutReducer } });
  render(
    <Provider store={store}>
      <CheckoutWizard />
    </Provider>,
  );
}

async function fillCardAndDeliveryForm(cardNumber: string) {
  await userEvent.type(screen.getByLabelText('Número de tarjeta', { exact: false }), cardNumber);
  await userEvent.type(screen.getByLabelText('Nombre del titular'), 'Jane Doe');
  await userEvent.type(screen.getByLabelText('Vencimiento'), '1229');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 123 #45-67, apto 8');
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogotá');
  await userEvent.type(screen.getByLabelText('Celular'), '3001234567');
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
  });

  it('completes the 5-step flow end to end on an approved payment', async () => {
    renderWizard();

    await screen.findByText('Audífonos inalámbricos');
    await userEvent.click(screen.getAllByRole('button', { name: /pagar con tarjeta/i })[0]);

    expect(screen.getByRole('dialog', { name: 'Datos de pago y entrega' })).toBeInTheDocument();
    await fillCardAndDeliveryForm('4242424242424242'); // valid, even last digit → simulated approval
    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    expect(await screen.findByText('Resumen de pago')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /pagar \$/i }));

    expect(screen.getByText('Procesando pago…')).toBeInTheDocument();
    expect(await screen.findByText('Pago aprobado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver a la tienda' }));

    expect(await screen.findByText('Stock actualizado: quedan 4 unidades.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('4 disponibles')).toBeInTheDocument());
  }, 10000);

  it('allows retrying with the summary kept after a declined payment', async () => {
    renderWizard();

    await screen.findByText('Audífonos inalámbricos');
    await userEvent.click(screen.getAllByRole('button', { name: /pagar con tarjeta/i })[0]);
    await fillCardAndDeliveryForm('4111111111111111'); // valid, odd last digit → simulated decline
    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    await screen.findByText('Resumen de pago');
    await userEvent.click(screen.getByRole('button', { name: /pagar \$/i }));

    expect(await screen.findByText('Pago rechazado', undefined, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar pago' }));

    expect(screen.getByRole('dialog', { name: 'Datos de pago y entrega' })).toBeInTheDocument();
    expect(screen.getByLabelText('CVC')).toHaveValue('');
    expect(screen.getByLabelText('Nombre del titular')).toHaveValue('Jane Doe');
  }, 10000);
});
