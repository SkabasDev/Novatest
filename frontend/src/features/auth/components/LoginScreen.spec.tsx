import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../authSlice';
import { authApi } from '../authApi';
import { LoginScreen } from './LoginScreen';

jest.mock('../authApi');

function renderWithStore() {
  const store = configureStore({ reducer: { auth: authReducer } });
  return store;
}

const profile = {
  id: 'u-1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '3001234567',
  documentId: '1234567890',
  defaultAddress: null,
  defaultCity: null,
};

describe('LoginScreen', () => {
  it('renders the pending purchase summary when provided', () => {
    const store = renderWithStore();
    render(
      <Provider store={store}>
        <LoginScreen
          pendingSummary={{ label: 'Audífonos × 2', subtotalInCents: 300000 }}
          backLabel="‹ Audífonos"
          onBack={jest.fn()}
          onNavigateToRegister={jest.fn()}
          onSuccess={jest.fn()}
        />
      </Provider>,
    );

    expect(screen.getByText(/Vas a pagar/)).toBeInTheDocument();
    expect(screen.getByText(/Así tus datos de entrega se cargan solos/)).toBeInTheDocument();
  });

  it('calls onSuccess after a successful login', async () => {
    (authApi.login as jest.Mock).mockResolvedValue({ token: 'signed-token', user: profile });
    const onSuccess = jest.fn();
    const store = renderWithStore();

    render(
      <Provider store={store}>
        <LoginScreen backLabel="‹ Productos" onBack={jest.fn()} onNavigateToRegister={jest.fn()} onSuccess={onSuccess} />
      </Provider>,
    );

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows the generic credentials error and clears it when editing', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
    const store = renderWithStore();

    render(
      <Provider store={store}>
        <LoginScreen backLabel="‹ Productos" onBack={jest.fn()} onNavigateToRegister={jest.fn()} onSuccess={jest.fn()} />
      </Provider>,
    );

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('El email o la contraseña no coinciden. Revisa e intenta de nuevo.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Email'), 'x');
    expect(screen.queryByText('El email o la contraseña no coinciden. Revisa e intenta de nuevo.')).not.toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const store = renderWithStore();
    render(
      <Provider store={store}>
        <LoginScreen backLabel="‹ Productos" onBack={jest.fn()} onNavigateToRegister={jest.fn()} onSuccess={jest.fn()} />
      </Provider>,
    );

    const passwordInput = screen.getByLabelText(/^Contraseña/) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));
    expect(passwordInput.type).toBe('text');
  });
});
