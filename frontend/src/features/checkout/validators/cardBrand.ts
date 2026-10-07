export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

const VISA_REGEX = /^4\d{0,15}$/;
const MASTERCARD_REGEX = /^(5[1-5]\d{0,14}|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)\d{0,12})$/;

/** Detects the card brand as the user types — prefix 4 → VISA; 51-55 or 2221-2720 → MasterCard (spec §6). */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');
  if (VISA_REGEX.test(digits)) return 'VISA';
  if (MASTERCARD_REGEX.test(digits)) return 'MASTERCARD';
  return 'UNKNOWN';
}
