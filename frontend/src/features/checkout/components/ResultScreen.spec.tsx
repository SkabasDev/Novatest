import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutSummary, PaymentResult } from '../checkoutSlice';
import * as receipt from '../receipt';
import { ResultScreen } from './ResultScreen';

jest.mock('../receipt');

const summary: CheckoutSummary = {
  lines: [{ productId: 'p-1', productName: 'Audífonos', unitPriceInCents: 150_000_00, quantity: 1 }],
  baseFeeInCents: 300_000,
  deliveryFeeInCents: 1_200_000,
  delivery: { address: 'Calle 123', city: 'Bogotá', phone: '3001234567' },
  cardLast4: '4242',
  cardBrand: 'VISA',
};

describe('ResultScreen', () => {
  it('shows the approved copy, delivery details and total paid', () => {
    const result: PaymentResult = { status: 'APPROVED', transactionReference: 'SIM-1' };
    render(<ResultScreen summary={summary} result={result} onRetry={jest.fn()} onBackToStore={jest.fn()} onDeclinedBack={jest.fn()} />);

    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    expect(screen.getByText(/Calle 123, Bogotá/)).toBeInTheDocument();
    expect(screen.getByText('Total pagado')).toBeInTheDocument();
    expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument();
    expect(screen.getByText('SIM-1')).toBeInTheDocument();
  });

  it('triggers the receipt download when approved', async () => {
    const result: PaymentResult = { status: 'APPROVED', transactionReference: 'SIM-1' };
    render(<ResultScreen summary={summary} result={result} onRetry={jest.fn()} onBackToStore={jest.fn()} onDeclinedBack={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /descargar comprobante/i }));
    expect(receipt.downloadReceipt).toHaveBeenCalledWith(summary, result);
  });

  it('shows the declined copy, defaults to "Volver al producto", and calls onRetry', async () => {
    const onRetry = jest.fn();
    const result: PaymentResult = { status: 'DECLINED', transactionReference: 'SIM-2' };
    render(<ResultScreen summary={summary} result={result} onRetry={onRetry} onBackToStore={jest.fn()} onDeclinedBack={jest.fn()} />);

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText('Monto no cobrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al producto' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar pago' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('uses the given declinedBackLabel and calls onDeclinedBack, not onBackToStore', async () => {
    const onDeclinedBack = jest.fn();
    const onBackToStore = jest.fn();
    const result: PaymentResult = { status: 'DECLINED', transactionReference: 'SIM-2' };
    render(
      <ResultScreen
        summary={summary}
        result={result}
        onRetry={jest.fn()}
        onBackToStore={onBackToStore}
        onDeclinedBack={onDeclinedBack}
        declinedBackLabel="Volver al carrito"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Volver al carrito' }));
    expect(onDeclinedBack).toHaveBeenCalledTimes(1);
    expect(onBackToStore).not.toHaveBeenCalled();
  });

  it('calls onBackToStore from the secondary button when approved', async () => {
    const onBackToStore = jest.fn();
    const result: PaymentResult = { status: 'APPROVED', transactionReference: 'SIM-3' };
    render(<ResultScreen summary={summary} result={result} onRetry={jest.fn()} onBackToStore={onBackToStore} onDeclinedBack={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Volver a la tienda' }));
    expect(onBackToStore).toHaveBeenCalledTimes(1);
  });
});
