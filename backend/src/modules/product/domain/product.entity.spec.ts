import { DomainErrorCode } from '../../shared-kernel/domain-error';
import { Product } from './product.entity';

describe('Product entity', () => {
  const buildProduct = (stock = 5) =>
    Product.create({
      id: 'p-1',
      name: 'Wireless Headphones',
      description: 'Noise cancelling',
      priceInCents: 1_500_00,
      currency: 'COP',
      stock,
      imageUrl: 'https://example.com/img.png',
    });

  it('reports available stock correctly', () => {
    const product = buildProduct(3);
    expect(product.hasStockFor(3)).toBe(true);
    expect(product.hasStockFor(4)).toBe(false);
  });

  it('decrements stock and returns a new Product instance without mutating the original', () => {
    const product = buildProduct(5);
    const result = product.decrementStock(2);

    expect(result.isOk).toBe(true);
    expect(result.getValue().stock).toBe(3);
    expect(product.stock).toBe(5);
  });

  it('fails with INSUFFICIENT_STOCK when quantity exceeds stock', () => {
    const product = buildProduct(1);
    const result = product.decrementStock(2);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INSUFFICIENT_STOCK);
  });

  it('fails with VALIDATION_ERROR when quantity is zero or negative', () => {
    const product = buildProduct(5);
    const result = product.decrementStock(0);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.VALIDATION_ERROR);
  });
});
