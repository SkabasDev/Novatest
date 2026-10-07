import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import authReducer from '../authSlice';
import { authApi } from '../authApi';
import { RegisterScreen } from './RegisterScreen';

jest.mock('../authApi');

function buildStore() {
  return configureStore({ reducer: { auth: authReducer } });
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

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Jane Doe');
  await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
  await userEvent.type(screen.getByLabelText('Celular'), '3001234567');
  await userEvent.type(screen.getByLabelText('Cédula'), '1234567890');
  await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
  await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
}

describe('RegisterScreen', () => {
  it('shows the permanent password hint until there is an error', () => {
    render(
      <Provider store={buildStore()}>
        <RegisterScreen onNavigateToLogin={jest.fn()} onSuccess={jest.fn()} />
      </Provider>,
    );

    expect(screen.getByText('Mínimo 8 caracteres, con letras y números.')).toBeInTheDocument();
  });

  it('blocks submission and shows field errors when the form is empty', async () => {
    const onSuccess = jest.fn();
    render(
      <Provider store={buildStore()}>
        <RegisterScreen onNavigateToLogin={jest.fn()} onSuccess={onSuccess} />
      </Provider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Escribe tu nombre completo.')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows a mismatch error when passwords differ', async () => {
    render(
      <Provider store={buildStore()}>
        <RegisterScreen onNavigateToLogin={jest.fn()} onSuccess={jest.fn()} />
      </Provider>,
    );

    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'other456');
    await userEvent.tab();

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('registers and calls onSuccess with a valid form', async () => {
    (authApi.register as jest.Mock).mockResolvedValue({ token: 'signed-token', user: profile });
    const onSuccess = jest.fn();

    render(
      <Provider store={buildStore()}>
        <RegisterScreen onNavigateToLogin={jest.fn()} onSuccess={onSuccess} />
      </Provider>,
    );

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(authApi.register).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '3001234567',
      documentId: '1234567890',
      password: 'secret123',
    });
  });

  it('shows the server error when the email is already registered', async () => {
    (authApi.register as jest.Mock).mockRejectedValue(new Error('There is already an account with email jane@example.com'));

    render(
      <Provider store={buildStore()}>
        <RegisterScreen onNavigateToLogin={jest.fn()} onSuccess={jest.fn()} />
      </Provider>,
    );

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('There is already an account with email jane@example.com')).toBeInTheDocument();
  });
});
