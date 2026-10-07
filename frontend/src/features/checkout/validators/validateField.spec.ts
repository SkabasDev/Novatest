import {
  validateAddress,
  validateCardHolder,
  validateCardNumber,
  validateCity,
  validateCvc,
  validateExpiry,
  validatePhone,
} from './validateField';

describe('validateCardNumber', () => {
  it('requires a value', () => {
    expect(validateCardNumber('')).toBe('Ingresa el número de tu tarjeta.');
  });

  it('rejects an unsupported brand once 2+ digits are typed', () => {
    expect(validateCardNumber('60')).toBe('Por ahora aceptamos solo VISA y MasterCard.');
  });

  it('reports how many digits are missing', () => {
    expect(validateCardNumber('4242')).toBe('Faltan 12 dígitos. Son 16 en total.');
  });

  it('flags a Luhn-invalid 16-digit number', () => {
    expect(validateCardNumber('4242424242424241')).toBe('Este número no parece correcto. Revísalo con calma.');
  });

  it('accepts a valid 16-digit VISA number', () => {
    expect(validateCardNumber('4242424242424242')).toBeUndefined();
  });
});

describe('validateCardHolder', () => {
  it('requires a value', () => {
    expect(validateCardHolder('')).toBe('Escribe el nombre tal como aparece en la tarjeta.');
  });

  it('requires a first and last name', () => {
    expect(validateCardHolder('Ana')).toBe('Incluye nombre y apellido.');
  });

  it('accepts a full name', () => {
    expect(validateCardHolder('Ana Gómez')).toBeUndefined();
  });
});

describe('validateExpiry', () => {
  it('requires a value', () => {
    expect(validateExpiry('')).toBe('Ingresa mes y año.');
  });

  it('requires the MM/AA format', () => {
    expect(validateExpiry('1229')).toBe('Usa el formato MM/AA.');
  });

  it('rejects a month outside 01-12', () => {
    expect(validateExpiry('13/29')).toBe('El mes va de 01 a 12.');
  });

  it('rejects a past date', () => {
    expect(validateExpiry('01/20')).toBe('Esta fecha ya pasó.');
  });

  it('accepts a future date', () => {
    expect(validateExpiry('12/39')).toBeUndefined();
  });
});

describe('validateCvc', () => {
  it('requires a value', () => {
    expect(validateCvc('')).toBe('Está al reverso de la tarjeta.');
  });

  it('requires exactly 3 digits', () => {
    expect(validateCvc('12')).toBe('Son 3 dígitos.');
  });

  it('accepts 3 digits', () => {
    expect(validateCvc('123')).toBeUndefined();
  });
});

describe('validateAddress', () => {
  it('requires a value', () => {
    expect(validateAddress('')).toBe('Ingresa la dirección de entrega.');
  });

  it('requires at least 6 characters', () => {
    expect(validateAddress('Cl 1')).toBe('Agrega número y detalles (apto, torre).');
  });

  it('accepts a complete address', () => {
    expect(validateAddress('Calle 123 #45-67, apto 8')).toBeUndefined();
  });
});

describe('validateCity', () => {
  it('requires at least 3 characters', () => {
    expect(validateCity('Bo')).toBe('Indica tu ciudad.');
  });

  it('accepts a valid city', () => {
    expect(validateCity('Bogotá')).toBeUndefined();
  });
});

describe('validatePhone', () => {
  it('requires a value', () => {
    expect(validatePhone('')).toBe('Lo usamos para coordinar la entrega.');
  });

  it('requires 10 digits starting with 3', () => {
    expect(validatePhone('123456789')).toBe('Usa un celular de 10 dígitos que empiece por 3.');
    expect(validatePhone('4001234567')).toBe('Usa un celular de 10 dígitos que empiece por 3.');
  });

  it('accepts a valid cellphone number', () => {
    expect(validatePhone('3001234567')).toBeUndefined();
  });
});
