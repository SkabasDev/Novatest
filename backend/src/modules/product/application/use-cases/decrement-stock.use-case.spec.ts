import { DistributedLockPort } from '../../../shared-kernel/distributed-lock.port';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
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

  /** Runs `fn` immediately, as if the lock were always free — the happy-path default. */
  function buildPassthroughLock(): DistributedLockPort {
    const withLock = jest.fn(async (_key: string, _ttlMs: number, fn: () => Promise<unknown>) => Result.ok(await fn()));
    return { withLock: withLock as unknown as DistributedLockPort['withLock'] };
  }

  it('acquires a per-product lock, decrements stock and persists the updated product', async () => {
    const repository = buildRepository(buildProduct(5));
    const lock = buildPassthroughLock();
    const useCase = new DecrementStockUseCase(repository, lock);

    const result = await useCase.execute('p-1', 2);

    expect(result.isOk).toBe(true);
    expect(result.getValue().stock).toBe(3);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(lock.withLock).toHaveBeenCalledWith('product-stock:p-1', 5000, expect.any(Function));
  });

  it('fails with NOT_FOUND when the product does not exist', async () => {
    const repository = buildRepository(null);
    const useCase = new DecrementStockUseCase(repository, buildPassthroughLock());

    const result = await useCase.execute('missing-id', 1);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('fails with INSUFFICIENT_STOCK and does not persist when stock is not enough', async () => {
    const repository = buildRepository(buildProduct(1));
    const useCase = new DecrementStockUseCase(repository, buildPassthroughLock());

    const result = await useCase.execute('p-1', 5);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INSUFFICIENT_STOCK);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('fails with TRANSACTION_LOCKED and never reaches the repository when the lock is already held', async () => {
    const repository = buildRepository(buildProduct(5));
    const lock: DistributedLockPort = {
      withLock: jest.fn().mockResolvedValue(Result.fail(new DomainError(DomainErrorCode.TRANSACTION_LOCKED, 'locked'))),
    };
    const useCase = new DecrementStockUseCase(repository, lock);

    const result = await useCase.execute('p-1', 2);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.TRANSACTION_LOCKED);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
