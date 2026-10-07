import { detectCardBrand } from './cardBrand';
import { isValidLuhn } from './luhn';

export interface CheckoutFormValues {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvc: string;
  address: string;
  city: string;
  phone: string;
}

export type CheckoutFieldName = keyof CheckoutFormValues;

/** Exact validation messages from spec §6 — tone is calm, never blames the user. */
export function validateCardNumber(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 'Ingresa el número de tu tarjeta.';
  if (digits.length >= 2 && detectCardBrand(digits) === 'UNKNOWN') {
    return 'Por ahora aceptamos solo VISA y MasterCard.';
  }
  if (digits.length < 16) return `Faltan ${16 - digits.length} dígitos. Son 16 en total.`;
  if (!isValidLuhn(digits)) return 'Este número no parece correcto. Revísalo con calma.';
  return undefined;
}

export function validateCardHolder(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Escribe el nombre tal como aparece en la tarjeta.';
  if (trimmed.length < 5 || !trimmed.includes(' ')) return 'Incluye nombre y apellido.';
  return undefined;
}

export function validateExpiry(value: string): string | undefined {
  if (value.length === 0) return 'Ingresa mes y año.';
  if (!/^\d{2}\/\d{2}$/.test(value)) return 'Usa el formato MM/AA.';

  const [month, year] = value.split('/').map(Number);
  if (month < 1 || month > 12) return 'El mes va de 01 a 12.';

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Esta fecha ya pasó.';
  }

  return undefined;
}

export function validateCvc(value: string): string | undefined {
  if (value.length === 0) return 'Está al reverso de la tarjeta.';
  if (!/^\d{3}$/.test(value)) return 'Son 3 dígitos.';
  return undefined;
}

export function validateAddress(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Ingresa la dirección de entrega.';
  if (trimmed.length < 6) return 'Agrega número y detalles (apto, torre).';
  return undefined;
}

export function validateCity(value: string): string | undefined {
  if (value.trim().length < 3) return 'Indica tu ciudad.';
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 'Lo usamos para coordinar la entrega.';
  if (digits.length !== 10 || !digits.startsWith('3')) {
    return 'Usa un celular de 10 dígitos que empiece por 3.';
  }
  return undefined;
}

export const VALIDATORS: Record<CheckoutFieldName, (value: string) => string | undefined> = {
  cardNumber: validateCardNumber,
  cardHolder: validateCardHolder,
  expiry: validateExpiry,
  cvc: validateCvc,
  address: validateAddress,
  city: validateCity,
  phone: validatePhone,
};

/** A field's error becomes visible once it reaches this raw-digit length (spec §6: "al completar la longitud total"). */
export const COMPLETE_LENGTH: Partial<Record<CheckoutFieldName, number>> = {
  cardNumber: 16,
  expiry: 5,
};
