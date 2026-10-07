import { formatCurrency } from '../../../shared/utils/formatCurrency';

export interface PendingSummary {
  productName: string;
  quantity: number;
  subtotalInCents: number;
}

/** "Vas a pagar · {producto} × N · subtotal" — shown on Login/Register when they were opened from "Pagar" (spec §11.5-11.6). */
export function PendingPurchaseCard({ productName, quantity, subtotalInCents }: PendingSummary) {
  return (
    <div className="rounded border border-line bg-inset px-4 py-3 text-[14px] text-fg-2">
      Vas a pagar · {productName} × {quantity} ·{' '}
      <span className="font-semibold text-fg-1 tabular">{formatCurrency(subtotalInCents)}</span>
    </div>
  );
}
