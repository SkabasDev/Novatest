import { ChevronUp, CreditCard, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { Button } from '../../../shared/ui/Button';
import { Stepper } from '../../../shared/ui/Stepper';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { CheckoutSummary } from '../checkoutSlice';

interface SummaryBackdropProps {
  summary: CheckoutSummary;
  isProcessing: boolean;
  onPay: () => void;
  onEditData: () => void;
  onDismiss: () => void;
}

/** Bottom sheet summary per spec §7: collapsible breakdown, sticky footer total + CTA, processing state. */
export function SummaryBackdrop({ summary, isProcessing, onPay, onEditData, onDismiss }: SummaryBackdropProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true);
  const [expanded, setExpanded] = useState(true);

  const subtotalInCents = summary.unitPriceInCents * summary.quantity;
  const totalInCents = subtotalInCents + summary.baseFeeInCents + summary.deliveryFeeInCents;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end bg-[rgba(255,255,255,0.78)] backdrop-blur-sm"
      onKeyDown={(event) => event.key === 'Escape' && !isProcessing && onDismiss()}
    >
      <button
        type="button"
        aria-label="Cerrar resumen"
        disabled={isProcessing}
        className="min-h-6 flex-1"
        onClick={onDismiss}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-backdrop-title"
        className="relative mx-auto w-full max-w-sheet overflow-hidden rounded-t-lg bg-panel shadow-3"
        style={{ maxHeight: 'calc(100dvh - 24px)' }}
      >
        {isProcessing && (
          <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-primary-tint">
            <div className="h-full w-2/5 animate-slide bg-primary" />
          </div>
        )}

        <div className="shrink-0 px-5 pt-3">
          <div className="mx-auto h-1 w-9 rounded-sm bg-line-strong" />
          <div className="mt-3">
            <Stepper currentStep={3} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-overline uppercase text-fg-3">Paso 3 de 4</p>
              <h2 id="summary-backdrop-title" className="mt-1 font-display text-[20px] font-semibold text-fg-1">
                Resumen de pago
              </h2>
            </div>
            <button
              type="button"
              disabled={isProcessing}
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
              className="flex min-h-11 items-center gap-1 px-2 text-[14px] font-medium text-primary disabled:opacity-40"
            >
              {expanded ? 'Ocultar detalle' : 'Ver detalle'}
              <ChevronUp
                size={18}
                strokeWidth={1.75}
                className={`transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div
          className="grid overflow-hidden px-5 transition-[grid-template-rows] duration-slow ease-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-y-auto py-4">
            <dl className="flex flex-col gap-2.5 text-[15px]">
              <Row label={`${summary.productName} × ${summary.quantity}`} value={formatCurrency(subtotalInCents)} />
              <Row label="Tarifa base" value={formatCurrency(summary.baseFeeInCents)} />
              <Row label="Envío" value={formatCurrency(summary.deliveryFeeInCents)} />
            </dl>

            <div className="mt-4 flex flex-col gap-2 rounded border border-line bg-inset p-3.5 text-[14px] text-fg-2">
              <div className="flex items-center gap-2">
                <CreditCard size={16} strokeWidth={1.75} className="text-fg-3" aria-hidden="true" />
                <span className="font-mono">
                  {summary.cardBrand === 'UNKNOWN' ? 'Tarjeta' : summary.cardBrand} •••• {summary.cardLast4}
                </span>
              </div>
              <div className="flex items-start gap-2" style={{ overflowWrap: 'anywhere' }}>
                <MapPin size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg-3" aria-hidden="true" />
                <span>
                  {summary.delivery.address}, {summary.delivery.city}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={onEditData}
              className="mt-3 min-h-11 text-[14px] font-medium text-primary hover:underline disabled:opacity-40"
            >
              Editar datos
            </button>
          </div>
        </div>

        <div className="safe-bottom shrink-0 border-t border-line px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] text-fg-2">Total a pagar</span>
            <span className="font-display text-total font-bold text-fg-1 tabular">{formatCurrency(totalInCents)}</span>
          </div>
          <Button size="large" isLoading={isProcessing} loadingText="Procesando pago…" onClick={onPay}>
            🔒 Pagar {formatCurrency(totalInCents)}
          </Button>
          {isProcessing ? (
            <p aria-live="polite" className="mt-2 text-center text-caption text-fg-3">
              Estamos confirmando con tu banco. No cierres esta ventana.
            </p>
          ) : (
            <p className="mt-2 text-center text-caption text-fg-3">
              Tus datos viajan cifrados. Cobro único, sin suscripciones.
            </p>
          )}
        </div>
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
