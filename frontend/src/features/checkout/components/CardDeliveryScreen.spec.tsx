import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../../auth/authSlice';
import { CardDeliveryScreen } from './CardDeliveryScreen';

const user = {
  id: 'u-1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '3001234567',
  documentId: '123',
  defaultAddress: 'Calle 123',
  defaultCity: 'Bogotá',
};

function renderWithStore(authUser: typeof user | null = user) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: authUser, token: authUser ? 'token' : null, status: 'idle' as const, error: null, intent: 'direct' as const } },
  });
  render(
    <Provider store={store}>
      <CardDeliveryScreen productName="Audífonos" unitPriceInCents={150000} quantity={2} onBack={jest.fn()} onSubmit={jest.fn()} />
    </Provider>,
  );
}

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText('Número de tarjeta', { exact: false }), '4242424242424242');
  await userEvent.clear(screen.getByLabelText('Nombre del titular'));
  await userEvent.type(screen.getByLabelText('Nombre del titular'), 'Jane Doe');
  await userEvent.type(screen.getByLabelText('Vencimiento'), '1229');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.clear(screen.getByLabelText('Dirección'));
  await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 123 #45-67, apto 8');
  await userEvent.clear(screen.getByLabelText('Ciudad'));
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogotá');
  await userEvent.type(screen.getByLabelText('Celular', { exact: false }), '3001234567');
}

describe('CardDeliveryScreen', () => {
  it('renders as a normal page (no dialog role) with the product summary in the header', () => {
    renderWithStore();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Audífonos × 2 · $ 3.000')).toBeInTheDocument();
  });

  it('shows "Comprando como" and prefills the holder, address, city and phone from the profile', () => {
    renderWithStore();

    expect(screen.getByText('Jane Doe · jane@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del titular')).toHaveValue('Jane Doe');
    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle 123');
    expect(screen.getByLabelText('Ciudad')).toHaveValue('Bogotá');
    expect(screen.getByLabelText('Celular', { exact: false })).toHaveValue('3001234567');
    expect(screen.getByText('Desde tu perfil · puedes cambiarla')).toBeInTheDocument();
  });

  it('does not show the "Comprando como" row or the profile note without a session', () => {
    renderWithStore(null);
    expect(screen.queryByText(/Comprando como/)).not.toBeInTheDocument();
    expect(screen.queryByText('Desde tu perfil · puedes cambiarla')).not.toBeInTheDocument();
  });

  it('calls onBack with the product label', async () => {
    const onBack = jest.fn();
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <CardDeliveryScreen productName="Audífonos" unitPriceInCents={150000} quantity={1} onBack={onBack} onSubmit={jest.fn()} />
      </Provider>,
    );

    await userEvent.click(screen.getByRole('button', { name: '‹ Audífonos' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('submits the captured values once every field is valid', async () => {
    const onSubmit = jest.fn();
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <CardDeliveryScreen productName="Audífonos" unitPriceInCents={150000} quantity={1} onBack={jest.fn()} onSubmit={onSubmit} />
      </Provider>,
    );

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    expect(onSubmit).toHaveBeenCalledWith({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: 'Jane Doe',
      expiry: '12/29',
      cvc: '123',
      address: 'Calle 123 #45-67, apto 8',
      city: 'Bogotá',
      phone: '300 123 4567',
    });
  });

  it('blocks submission and shows the error count banner when required fields are missing', async () => {
    const onSubmit = jest.fn();
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <CardDeliveryScreen productName="Audífonos" unitPriceInCents={150000} quantity={1} onBack={jest.fn()} onSubmit={onSubmit} />
      </Provider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    expect(await screen.findByText(/Revisa \d campos? marcados? para continuar\./)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
