import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats cents with a dollar sign, a space and dot thousands separators', () => {
    expect(formatCurrency(404_900_00)).toBe('$ 404.900');
  });

  it('rounds to the nearest unit with no decimals', () => {
    expect(formatCurrency(1_000_50)).toBe('$ 1.001');
  });

  it('formats small amounts without separators', () => {
    expect(formatCurrency(50_00)).toBe('$ 50');
  });
});
