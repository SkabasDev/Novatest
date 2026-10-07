import { Inject, Injectable } from '@nestjs/common';
import { DISTRIBUTED_LOCK, DistributedLockPort } from '../../../shared-kernel/distributed-lock.port';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/product.entity';

const LOCK_TTL_MS = 5000;

@Injectable()
export class DecrementStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
    @Inject(DISTRIBUTED_LOCK) private readonly distributedLock: DistributedLockPort,
  ) {}

  /**
   * Read-check-write on `stock` is a classic lost-update race: two concurrent payments for the
   * same product can both read the same stock, both pass the stock check, and both save,
   * overselling it. A per-product Redis lock serializes this across every app instance so only
   * one decrement is ever in flight for a given product at a time.
   */
  async execute(productId: string, quantity: number): Promise<Result<Product, DomainError>> {
    const lockResult = await this.distributedLock.withLock(`product-stock:${productId}`, LOCK_TTL_MS, () =>
      this.decrementWithoutLock(productId, quantity),
    );

    if (lockResult.isFail) {
      return Result.fail(lockResult.getError());
    }

    return lockResult.getValue();
  }

  private async decrementWithoutLock(productId: string, quantity: number): Promise<Result<Product, DomainError>> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      return Result.fail(new DomainError(DomainErrorCode.NOT_FOUND, `Product ${productId} was not found`));
    }

    const decremented = product.decrementStock(quantity);

    if (decremented.isFail) {
      return Result.fail(decremented.getError());
    }

    const saved = await this.productRepository.save(decremented.getValue());
    return Result.ok(saved);
  }
}
