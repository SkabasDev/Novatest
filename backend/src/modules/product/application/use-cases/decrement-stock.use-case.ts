import { Inject, Injectable } from '@nestjs/common';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/product.entity';

@Injectable()
export class DecrementStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(productId: string, quantity: number): Promise<Result<Product, DomainError>> {
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
