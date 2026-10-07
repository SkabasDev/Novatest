import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { productApi } from '../productApi';
import productReducer from '../productSlice';
import { CatalogScreen } from './CatalogScreen';

jest.mock('../productApi');

function renderWithStore() {
  const store = configureStore({ reducer: { product: productReducer } });
  return store;
}

const products = [
  { id: 'p-1', name: 'Audífonos', description: 'd', priceInCents: 150000, currency: 'COP', stock: 5, imageUrl: 'img1.png' },
  { id: 'p-2', name: 'Teclado', description: 'd', priceInCents: 90000, currency: 'COP', stock: 2, imageUrl: 'img2.png' },
  { id: 'p-3', name: 'Mouse', description: 'd', priceInCents: 50000, currency: 'COP', stock: 0, imageUrl: 'img3.png' },
];

describe('CatalogScreen', () => {
  it('renders a card per product with name, price and stock label', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue(products);
    render(
      <Provider store={renderWithStore()}>
        <CatalogScreen onSelectProduct={jest.fn()} />
      </Provider>,
    );

    expect(await screen.findByText('Audífonos')).toBeInTheDocument();
    expect(screen.getByText('Teclado')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('5 disponibles')).toBeInTheDocument();
    expect(screen.getByText('Quedan 2')).toBeInTheDocument();
    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });

  it('calls onSelectProduct with the clicked product id, even when sold out', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue(products);
    const onSelectProduct = jest.fn();
    render(
      <Provider store={renderWithStore()}>
        <CatalogScreen onSelectProduct={onSelectProduct} />
      </Provider>,
    );

    await userEvent.click(await screen.findByText('Mouse'));
    expect(onSelectProduct).toHaveBeenCalledWith('p-3');
  });

  it('shows an empty-state message when there are no products', async () => {
    (productApi.fetchAll as jest.Mock).mockResolvedValue([]);
    render(
      <Provider store={renderWithStore()}>
        <CatalogScreen onSelectProduct={jest.fn()} />
      </Provider>,
    );

    expect(await screen.findByText('No hay productos disponibles.')).toBeInTheDocument();
  });
});
