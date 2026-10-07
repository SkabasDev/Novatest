import { detectCardBrand } from './cardBrand';

describe('detectCardBrand', () => {
  it('detects VISA numbers starting with 4', () => {
    expect(detectCardBrand('4242424242424242')).toBe('VISA');
    expect(detectCardBrand('4')).toBe('VISA');
  });

  it('detects MasterCard numbers in the 51-55 range', () => {
    expect(detectCardBrand('5555555555554444')).toBe('MASTERCARD');
    expect(detectCardBrand('51')).toBe('MASTERCARD');
  });

  it('detects MasterCard numbers in the 2221-2720 range', () => {
    expect(detectCardBrand('2221000000000000')).toBe('MASTERCARD');
  });

  it('returns UNKNOWN for unsupported prefixes', () => {
    expect(detectCardBrand('6011000000000000')).toBe('UNKNOWN');
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });

  it('ignores non-digit characters while typing', () => {
    expect(detectCardBrand('4242 4242')).toBe('VISA');
  });
});
