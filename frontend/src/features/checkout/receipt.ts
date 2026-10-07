import { CheckoutSummary, PaymentResult, subtotalInCents, totalInCents } from './checkoutSlice';
import { formatCurrency } from '../../shared/utils/formatCurrency';

/**
 * Builds and triggers the download of a plain-text receipt. Stands in for a real PDF — the
 * content (transaction number, date, masked card, holder, delivery, one row per line + subtotal,
 * total) matches what spec §5.4/§12.5 asks for; only the file format is a placeholder.
 */
export function downloadReceipt(summary: CheckoutSummary, result: PaymentResult): void {
  const lines = [
    'Comprobante de pago',
    '====================',
    `Fecha: ${new Date().toLocaleString('es-CO')}`,
    `N.º de transacción: ${result.transactionReference}`,
    `Tarjeta: ${summary.cardBrand} •••• ${summary.cardLast4}`,
    '',
    ...summary.lines.map((line) => `${line.productName} × ${line.quantity}: ${formatCurrency(line.unitPriceInCents * line.quantity)}`),
    `Subtotal: ${formatCurrency(subtotalInCents(summary))}`,
    `Tarifa base: ${formatCurrency(summary.baseFeeInCents)}`,
    `Envío: ${formatCurrency(summary.deliveryFeeInCents)}`,
    `Total pagado: ${formatCurrency(totalInCents(summary))}`,
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
