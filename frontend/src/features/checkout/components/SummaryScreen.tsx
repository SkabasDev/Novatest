import { CreditCard, MapPin } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { CheckoutSummary } from '../checkoutSlice';

interface SummaryScreenProps {
  summary: CheckoutSummary;
  isProcessing: boolean;
  onBack: () => void;
  onPay: () => void;
  onEditData: () => void;
}

/**
 * "Resumen de pago" as a full page (spec v2 §11.10 — replaces the v1 backdrop, which stays
 * untouched for that version). No collapse/expand state; normal page scroll; sticky CTA on mobile.
 */
export function SummaryScreen({ summary, isProcessing, onBack, onPay, onEditData }: SummaryScreenProps) {
  const subtotalInCents = summary.unitPriceInCents * summary.quantity;
  const totalInCents = subtotalInCents + summary.baseFeeInCents + summary.deliveryFeeInCents;

  return (
    <div className="mx-auto flex max-w-sheet flex-col gap-6 px-4 py-6 pb-28 md:pb-6">
      <button type="button" onClick={onBack} disabled={isProcessing} className="min-h-11 self-start text-[14px] font-medium text-primary disabled:opacity-40">
        ‹ Tarjeta y entrega
      </button>

      <h1 className="font-display text-[28px] font-bold leading-[1.14] tracking-[-0.03em] text-fg-1">
        Resumen de pago
      </h1>

      <div className="relative overflow-hidden rounded bg-panel p-4 shadow-1">
        {isProcessing && (
          <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-primary-tint">
            <div className="h-full w-2/5 animate-slide bg-primary" />
          </div>
        )}

        <dl className="flex flex-col gap-2.5 text-[15px]">
          <Row label={`${summary.productName} × ${summary.quantity}`} value={formatCurrency(subtotalInCents)} />
          <Row label="Tarifa base" value={formatCurrency(summary.baseFeeInCents)} />
          <Row label="Envío" value={formatCurrency(summary.deliveryFeeInCents)} />
        </dl>

        <div className="my-4 border-t border-line" />

        <div className="flex items-center justify-between">
          <span className="text-[15px] text-fg-2">Total a pagar</span>
          <span className="font-display text-total font-bold text-fg-1 tabular">{formatCurrency(totalInCents)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded bg-panel p-4 shadow-1">
        <div className="flex items-center gap-2 text-[14px] text-fg-2">
          <CreditCard size={16} strokeWidth={1.75} className="text-fg-3" aria-hidden="true" />
          <span className="font-mono">
            {summary.cardBrand === 'UNKNOWN' ? 'Tarjeta' : summary.cardBrand} •••• {summary.cardLast4}
          </span>
        </div>
        <div className="flex items-start gap-2 text-[14px] text-fg-2" style={{ overflowWrap: 'anywhere' }}>
          <MapPin size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg-3" aria-hidden="true" />
          <span>
            {summary.delivery.address}, {summary.delivery.city}
          </span>
        </div>
        <button
          type="button"
          disabled={isProcessing}
          onClick={onEditData}
          className="flex min-h-11 items-center text-[14px] font-medium text-primary hover:bg-primary-tint disabled:opacity-40"
        >
          Editar datos
        </button>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-base p-3 md:static md:border-0 md:p-0">
        <Button size="large" isLoading={isProcessing} loadingText="Procesando pago…" onClick={onPay}>
          🔒 Pagar {formatCurrency(totalInCents)}
        </Button>
        {isProcessing ? (
          <p aria-live="polite" className="mt-2 text-center text-caption text-fg-3">
            Estamos confirmando con tu banco. No cierres esta ventana.
          </p>
        ) : (
          <p className="mt-2 text-center text-caption text-fg-3">Tus datos viajan cifrados. Cobro único, sin suscripciones.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-fg-2">{label}</dt>
      <dd className="tabular text-fg-1">{value}</dd>
    </div>
  );
}
