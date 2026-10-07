import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryBackdrop } from './SummaryBackdrop';

const summary = {
  productName: 'Audífonos',
  unitPriceInCents: 150_000_00,
  quantity: 2,
  baseFeeInCents: 300_000,
  deliveryFeeInCents: 1_200_000,
  delivery: { address: 'Calle 123', city: 'Bogotá', phone: '3001234567' },
  cardLast4: '4242',
  cardBrand: 'VISA' as const,
};

describe('SummaryBackdrop', () => {
  it('renders the breakdown and the total', () => {
    render(<SummaryBackdrop summary={summary} isProcessing={false} onPay={jest.fn()} onEditData={jest.fn()} onDismiss={jest.fn()} />);

    expect(screen.getByText('Audífonos × 2')).toBeInTheDocument();
    expect(screen.getByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.getByText('Total a pagar')).toBeInTheDocument();
    expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument();
  });

  it('toggles the detail section', async () => {
    render(<SummaryBackdrop summary={summary} isProcessing={false} onPay={jest.fn()} onEditData={jest.fn()} onDismiss={jest.fn()} />);

    const toggle = screen.getByRole('button', { name: /ocultar detalle/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: /ver detalle/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onPay when the pay button is clicked', async () => {
    const onPay = jest.fn();
    render(<SummaryBackdrop summary={summary} isProcessing={false} onPay={onPay} onEditData={jest.fn()} onDismiss={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('shows the processing state and disables editing', () => {
    render(<SummaryBackdrop summary={summary} isProcessing onPay={jest.fn()} onEditData={jest.fn()} onDismiss={jest.fn()} />);

    expect(screen.getByText('Procesando pago…')).toBeInTheDocument();
    expect(screen.getByText(/Estamos confirmando con tu banco/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar datos' })).toBeDisabled();
  });

  it('calls onEditData when editing is requested', async () => {
    const onEditData = jest.fn();
    render(<SummaryBackdrop summary={summary} isProcessing={false} onPay={jest.fn()} onEditData={onEditData} onDismiss={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar datos' }));
    expect(onEditData).toHaveBeenCalledTimes(1);
  });
});
