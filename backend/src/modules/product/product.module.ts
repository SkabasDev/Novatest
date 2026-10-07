import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LockModule } from '../shared-kernel/lock.module';
import { PRODUCT_REPOSITORY } from './domain/ports/product-repository.port';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { DecrementStockUseCase } from './application/use-cases/decrement-stock.use-case';
import { ProductController } from './infrastructure/http/product.controller';
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity';
import { ProductTypeOrmRepository } from './infrastructure/persistence/product.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity]), LockModule],
  controllers: [ProductController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductTypeOrmRepository },
    GetProductsUseCase,
    GetProductByIdUseCase,
    DecrementStockUseCase,
  ],
  exports: [DecrementStockUseCase, GetProductByIdUseCase],
})
export class ProductModule {}
