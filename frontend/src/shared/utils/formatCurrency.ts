/** Formats cents as "$ 404.900" (COP, dot as thousands separator, no decimals) per the design spec. */
export function formatCurrency(amountInCents: number): string {
  const units = Math.round(amountInCents / 100);
  const formatted = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(units);
  return `$ ${formatted}`;
}
