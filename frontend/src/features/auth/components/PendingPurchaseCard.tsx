import { formatCurrency } from '../../../shared/utils/formatCurrency';

export interface PendingSummary {
  /** "{producto} × N" for a single-product purchase, "N productos" for a cart checkout. */
  label: string;
  subtotalInCents: number;
}

/** "Vas a pagar · {label} · subtotal" — shown on Login/Register when opened from "Pagar" (spec §11.5-11.6/§12.5). */
export function PendingPurchaseCard({ label, subtotalInCents }: PendingSummary) {
  return (
    <div className="rounded border border-line bg-inset px-4 py-3 text-[14px] text-fg-2">
      Vas a pagar · {label} ·{' '}
      <span className="font-semibold text-fg-1 tabular">{formatCurrency(subtotalInCents)}</span>
    </div>
  );
}
