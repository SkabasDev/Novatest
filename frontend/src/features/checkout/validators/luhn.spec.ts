import { isValidLuhn } from './luhn';

describe('isValidLuhn', () => {
  it('accepts a valid test VISA number', () => {
    expect(isValidLuhn('4242424242424242')).toBe(true);
  });

  it('accepts a valid test MasterCard number', () => {
    expect(isValidLuhn('5555555555554444')).toBe(true);
  });

  it('rejects a number that fails the checksum', () => {
    expect(isValidLuhn('4242424242424241')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidLuhn('')).toBe(false);
  });

  it('ignores spaces in the input', () => {
    expect(isValidLuhn('4242 4242 4242 4242')).toBe(true);
  });
});
