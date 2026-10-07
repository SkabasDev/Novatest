import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutSummary } from '../checkoutSlice';
import { SummaryScreen } from './SummaryScreen';

const singleLineSummary: CheckoutSummary = {
  lines: [{ productId: 'p-1', productName: 'Audífonos', unitPriceInCents: 150_000_00, quantity: 2 }],
  baseFeeInCents: 300_000,
  deliveryFeeInCents: 1_200_000,
  delivery: { address: 'Calle 123', city: 'Bogotá', phone: '3001234567' },
  cardLast4: '4242',
  cardBrand: 'VISA',
};

const multiLineSummary: CheckoutSummary = {
  ...singleLineSummary,
  lines: [
    { productId: 'p-1', productName: 'Audífonos', unitPriceInCents: 150_000_00, quantity: 2 },
    { productId: 'p-2', productName: 'Teclado', unitPriceInCents: 90_000_00, quantity: 1 },
  ],
};

describe('SummaryScreen', () => {
  it('renders as a normal page (no dialog role) with the breakdown and total', () => {
    render(<SummaryScreen summary={singleLineSummary} isProcessing={false} onBack={jest.fn()} onPay={jest.fn()} onEditData={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Audífonos × 2')).toBeInTheDocument();
    expect(screen.getByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Total a pagar')).toBeInTheDocument();
    expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument();
  });

  it('renders one row per cart line and totals across all of them', () => {
    render(<SummaryScreen summary={multiLineSummary} isProcessing={false} onBack={jest.fn()} onPay={jest.fn()} onEditData={jest.fn()} />);

    expect(screen.getByText('Audífonos × 2')).toBeInTheDocument();
    expect(screen.getByText('Teclado × 1')).toBeInTheDocument();
    // total = $300.000 (Audífonos × 2) + $90.000 (Teclado × 1) + $3.000 (base) + $12.000 (envío)
    expect(screen.getByRole('button', { name: /pagar \$ 405\.000/i })).toBeInTheDocument();
  });

  it('never shows a collapse/expand toggle', () => {
    render(<SummaryScreen summary={singleLineSummary} isProcessing={false} onBack={jest.fn()} onPay={jest.fn()} onEditData={jest.fn()} />);
    expect(screen.queryByText(/Ocultar detalle|Ver detalle/)).not.toBeInTheDocument();
  });

  it('calls onBack with the "‹ Tarjeta y entrega" label', async () => {
    const onBack = jest.fn();
    render(<SummaryScreen summary={singleLineSummary} isProcessing={false} onBack={onBack} onPay={jest.fn()} onEditData={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '‹ Tarjeta y entrega' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onPay and onEditData', async () => {
    const onPay = jest.fn();
    const onEditData = jest.fn();
    render(<SummaryScreen summary={singleLineSummary} isProcessing={false} onBack={jest.fn()} onPay={onPay} onEditData={onEditData} />);

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(onPay).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Editar datos' }));
    expect(onEditData).toHaveBeenCalledTimes(1);
  });

  it('shows the processing state and disables back/edit', () => {
    render(<SummaryScreen summary={singleLineSummary} isProcessing onBack={jest.fn()} onPay={jest.fn()} onEditData={jest.fn()} />);

    expect(screen.getByText('Procesando pago…')).toBeInTheDocument();
    expect(screen.getByText(/Estamos confirmando con tu banco/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '‹ Tarjeta y entrega' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Editar datos' })).toBeDisabled();
  });
});
