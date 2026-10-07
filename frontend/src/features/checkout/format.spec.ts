import { formatCardHolder, formatCardNumber, formatCvc, formatExpiry, formatPhone } from './format';

describe('formatCardNumber', () => {
  it('groups digits in blocks of 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('caps at 16 digits and strips non-digits', () => {
    expect(formatCardNumber('4242-4242-4242-4242-9999')).toBe('4242 4242 4242 4242');
  });
});

describe('formatCardHolder', () => {
  it('strips digits and symbols', () => {
    expect(formatCardHolder('Jane123 Doe!')).toBe('Jane Doe');
  });

  it('collapses repeated spaces', () => {
    expect(formatCardHolder('Jane   Doe')).toBe('Jane Doe');
  });
});

describe('formatExpiry', () => {
  it('inserts the slash after 2 digits', () => {
    expect(formatExpiry('1229')).toBe('12/29');
  });

  it('does not insert the slash before 2 digits', () => {
    expect(formatExpiry('1')).toBe('1');
  });

  it('caps at 4 raw digits', () => {
    expect(formatExpiry('122999')).toBe('12/29');
  });
});

describe('formatCvc', () => {
  it('caps at 3 digits and strips non-digits', () => {
    expect(formatCvc('1a2b3c4')).toBe('123');
  });
});

describe('formatPhone', () => {
  it('groups a 10-digit number as 3-3-4', () => {
    expect(formatPhone('3001234567')).toBe('300 123 4567');
  });

  it('formats a partial number progressively', () => {
    expect(formatPhone('300123')).toBe('300 123');
  });
});
