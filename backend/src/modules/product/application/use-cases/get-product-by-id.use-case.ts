import { Inject, Injectable } from '@nestjs/common';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/product.entity';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, DomainError>> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return Result.fail(new DomainError(DomainErrorCode.NOT_FOUND, `Product ${id} was not found`));
    }

    return Result.ok(product);
  }
}
