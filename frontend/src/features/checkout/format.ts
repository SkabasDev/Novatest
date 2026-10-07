/** Groups digits as "0000 0000 0000 0000", capped at 16 digits. */
export function formatCardNumber(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Blocks digits and collapses repeated spaces — card holder names only have letters/spaces. */
export function formatCardHolder(rawInput: string): string {
  return rawInput.replace(/[^A-Za-zÀ-ÿ\s]/g, '').replace(/\s{2,}/g, ' ');
}

/** Inserts the "/" automatically after 2 digits, capped at "MM/AA" (5 chars). */
export function formatExpiry(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvc(rawInput: string): string {
  return rawInput.replace(/\D/g, '').slice(0, 3);
}

/** Groups a 10-digit cellphone as "300 123 4567". */
export function formatPhone(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
  return parts.join(' ');
}
