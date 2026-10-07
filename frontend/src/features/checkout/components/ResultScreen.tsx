import { AlertCircle, Check, Download } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { CheckoutSummary, PaymentResult } from '../checkoutSlice';
import { downloadReceipt } from '../receipt';

interface ResultScreenProps {
  summary: CheckoutSummary;
  result: PaymentResult;
  onRetry: () => void;
  onBackToStore: () => void;
}

/** Final status screen per spec §5.4 — approved and declined share the same data card, different copy/CTA. */
export function ResultScreen({ summary, result, onRetry, onBackToStore }: ResultScreenProps) {
  const isApproved = result.status === 'APPROVED';
  const subtotalInCents = summary.unitPriceInCents * summary.quantity;
  const totalInCents = subtotalInCents + summary.baseFeeInCents + summary.deliveryFeeInCents;

  return (
    <div className="mx-auto flex max-w-result flex-col items-center gap-4 px-4 py-8 text-center">
      {isApproved ? (
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-success-tint ring-[6px] ring-success/40">
          <Check size={36} strokeWidth={2} className="text-success" aria-hidden="true" />
        </span>
      ) : (
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-danger-tint ring-[6px] ring-danger/40">
          <AlertCircle size={36} strokeWidth={2} className="text-danger" aria-hidden="true" />
        </span>
      )}

      <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">
        {isApproved ? 'Pago aprobado' : 'Pago rechazado'}
      </h1>

      {isApproved ? (
        <p className="text-[16px] text-fg-2">
          Listo. Enviaremos tu pedido a {summary.delivery.address}, {summary.delivery.city}. Te avisaremos por SMS al{' '}
          {summary.delivery.phone}.
        </p>
      ) : (
        <>
          <p className="text-[16px] text-fg-2">
            Tu banco no autorizó la transacción. No se hizo ningún cobro a tu tarjeta.
          </p>
          <p className="text-[14px] text-fg-3">
            Revisa el cupo disponible o intenta con otra tarjeta. Tus datos de entrega se conservan.
          </p>
        </>
      )}

      <dl className="w-full divide-y divide-line rounded border border-line bg-panel text-left text-[14px]">
        <Row label={isApproved ? 'Total pagado' : 'Monto no cobrado'} value={formatCurrency(totalInCents)} />
        <Row label="Tarjeta" value={`${summary.cardBrand} •••• ${summary.cardLast4}`} />
        <Row label="N.º de transacción" valueClassName="font-mono text-[13px]" value={result.transactionReference} />
      </dl>

      {isApproved ? (
        <>
          <Button icon={<Download size={18} strokeWidth={1.75} aria-hidden="true" />} onClick={() => downloadReceipt(summary, result)}>
            Descargar comprobante
          </Button>
          <Button variant="secondary" onClick={onBackToStore}>
            Volver a la tienda
          </Button>
        </>
      ) : (
        <>
          <Button onClick={onRetry}>Reintentar pago</Button>
          <Button variant="secondary" onClick={onBackToStore}>
            Volver al producto
          </Button>
        </>
      )}
    </div>
  );
}

function Row({ label, value, valueClassName = '' }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <dt className="text-fg-2">{label}</dt>
      <dd className={`text-fg-1 ${valueClassName}`}>{value}</dd>
    </div>
  );
}
