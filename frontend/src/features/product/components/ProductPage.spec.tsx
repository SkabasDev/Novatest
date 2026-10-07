import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import checkoutReducer from '../../checkout/checkoutSlice';
import { productApi } from '../productApi';
import productReducer from '../productSlice';
import { ProductPage } from './ProductPage';

jest.mock('../productApi');

function renderWithStore() {
  const store = configureStore({ reducer: { product: productReducer, checkout: checkoutReducer } });
  render(
    <Provider store={store}>
      <ProductPage />
    </Provider>,
  );
  return store;
}

const baseProduct = {
  id: 'p-1',
  name: 'Audífonos inalámbricos',
  description: 'desc',
  priceInCents: 150000,
  currency: 'COP',
  imageUrl: 'img.png',
};

describe('ProductPage', () => {
  it('renders the name, price and stock once loaded', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);

    renderWithStore();

    expect(await screen.findByText('Audífonos inalámbricos')).toBeInTheDocument();
    expect(screen.getByText('5 disponibles')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /pagar con tarjeta/i })[0]).toBeEnabled();
  });

  it('shows the amber low-stock message at 3 units or fewer', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 2 }]);

    renderWithStore();

    expect(await screen.findByText('Quedan solo 2 unidades')).toBeInTheDocument();
  });

  it('disables the pay button and hides the stepper when sold out', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 0 }]);

    renderWithStore();

    expect(await screen.findByText('Agotado por ahora')).toBeInTheDocument();
    screen.getAllByRole('button', { name: /agotado/i }).forEach((button) => expect(button).toBeDisabled());
    expect(screen.queryByLabelText('Aumentar cantidad')).not.toBeInTheDocument();
  });

  it('increments quantity and shows the subtotal from 2 units up', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([{ ...baseProduct, stock: 5 }]);

    renderWithStore();
    await screen.findByText('Audífonos inalámbricos');

    await userEvent.click(screen.getByLabelText('Aumentar cantidad'));

    await waitFor(() => expect(screen.getByText('Subtotal (2 unidades)')).toBeInTheDocument());
  });

  it('shows an error message when the request fails', async () => {
    (productApi.fetchAll as jest.Mock).mockRejectedValue(new Error('network error'));

    renderWithStore();

    expect(await screen.findByText('network error')).toBeInTheDocument();
  });
});
