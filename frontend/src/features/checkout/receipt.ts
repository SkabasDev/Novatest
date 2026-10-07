import { CheckoutSummary, PaymentResult } from './checkoutSlice';
import { formatCurrency } from '../../shared/utils/formatCurrency';

/**
 * Builds and triggers the download of a plain-text receipt. Stands in for a real PDF — the
 * content (transaction number, date, masked card, holder, delivery, breakdown, total) matches
 * what spec §5.4 asks for; only the file format is a placeholder.
 */
export function downloadReceipt(summary: CheckoutSummary, result: PaymentResult): void {
  const subtotalInCents = summary.unitPriceInCents * summary.quantity;
  const totalInCents = subtotalInCents + summary.baseFeeInCents + summary.deliveryFeeInCents;

  const lines = [
    'Comprobante de pago',
    '====================',
    `Fecha: ${new Date().toLocaleString('es-CO')}`,
    `N.º de transacción: ${result.transactionReference}`,
    `Tarjeta: ${summary.cardBrand} •••• ${summary.cardLast4}`,
    '',
    `${summary.productName} × ${summary.quantity}: ${formatCurrency(subtotalInCents)}`,
    `Tarifa base: ${formatCurrency(summary.baseFeeInCents)}`,
    `Envío: ${formatCurrency(summary.deliveryFeeInCents)}`,
    `Total pagado: ${formatCurrency(totalInCents)}`,
    '',
    `Entrega: ${summary.delivery.address}, ${summary.delivery.city}`,
    `Celular: ${summary.delivery.phone}`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `comprobante-${result.transactionReference}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
