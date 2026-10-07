import {
  validateConfirmPassword,
  validateDocumentId,
  validateEmail,
  validateFullName,
  validateLoginEmail,
  validateLoginPassword,
  validatePassword,
  validatePhone,
} from './validators';

describe('validateFullName', () => {
  it('requires a value', () => {
    expect(validateFullName('')).toBe('Escribe tu nombre completo.');
  });
  it('requires a first and last name', () => {
    expect(validateFullName('Ana')).toBe('Incluye nombre y apellido.');
  });
  it('accepts a full name', () => {
    expect(validateFullName('Ana Gómez')).toBeUndefined();
  });
});

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Ingresa tu email.');
  });
  it('rejects an invalid format', () => {
    expect(validateEmail('ana@')).toBe('Revisa el formato, por ejemplo nombre@correo.com.');
  });
  it('accepts a valid email', () => {
    expect(validateEmail('ana@correo.com')).toBeUndefined();
  });
});

describe('validatePhone', () => {
  it('requires 10 digits starting with 3', () => {
    expect(validatePhone('123')).toBe('Usa un celular de 10 dígitos que empiece por 3.');
    expect(validatePhone('4001234567')).toBe('Usa un celular de 10 dígitos que empiece por 3.');
  });
  it('accepts a valid cellphone', () => {
    expect(validatePhone('3001234567')).toBeUndefined();
  });
});

describe('validateDocumentId', () => {
  it('requires between 6 and 10 digits', () => {
    expect(validateDocumentId('123')).toBe('La cédula tiene entre 6 y 10 dígitos.');
  });
  it('accepts a valid document id', () => {
    expect(validateDocumentId('1234567')).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('requires at least 8 chars with a letter and a number', () => {
    expect(validatePassword('abc')).toBe('Mínimo 8 caracteres, con letras y números.');
    expect(validatePassword('abcdefgh')).toBe('Mínimo 8 caracteres, con letras y números.');
  });
  it('accepts a valid password', () => {
    expect(validatePassword('abcd1234')).toBeUndefined();
  });
});

describe('validateConfirmPassword', () => {
  it('requires matching passwords', () => {
    expect(validateConfirmPassword('abcd1234', 'abcd9999')).toBe('Las contraseñas no coinciden.');
  });
  it('accepts a matching confirmation', () => {
    expect(validateConfirmPassword('abcd1234', 'abcd1234')).toBeUndefined();
  });
});

describe('validateLoginEmail / validateLoginPassword', () => {
  it('require a value', () => {
    expect(validateLoginEmail('')).toBe('Ingresa tu email.');
    expect(validateLoginPassword('')).toBe('Ingresa tu contraseña.');
  });
});
