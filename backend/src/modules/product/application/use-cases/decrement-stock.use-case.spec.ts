import { DomainErrorCode } from '../../../shared-kernel/domain-error';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/product.entity';
import { DecrementStockUseCase } from './decrement-stock.use-case';

describe('DecrementStockUseCase', () => {
  const buildProduct = (stock: number) =>
    Product.create({
      id: 'p-1',
      name: 'Headphones',
      description: 'desc',
      priceInCents: 1000,
      currency: 'COP',
      stock,
      imageUrl: 'img.png',
    });

  function buildRepository(product: Product | null): ProductRepositoryPort {
    return {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(product),
      save: jest.fn().mockImplementation((p: Product) => Promise.resolve(p)),
    };
  }

  it('decrements stock and persists the updated product', async () => {
    const repository = buildRepository(buildProduct(5));
    const useCase = new DecrementStockUseCase(repository);

    const result = await useCase.execute('p-1', 2);

    expect(result.isOk).toBe(true);
    expect(result.getValue().stock).toBe(3);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('fails with NOT_FOUND when the product does not exist', async () => {
    const repository = buildRepository(null);
    const useCase = new DecrementStockUseCase(repository);

    const result = await useCase.execute('missing-id', 1);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('fails with INSUFFICIENT_STOCK and does not persist when stock is not enough', async () => {
    const repository = buildRepository(buildProduct(1));
    const useCase = new DecrementStockUseCase(repository);

    const result = await useCase.execute('p-1', 5);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INSUFFICIENT_STOCK);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
