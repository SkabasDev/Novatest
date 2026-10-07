import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer-repository.port';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { CustomerController } from './infrastructure/http/customer.controller';
import { CustomerOrmEntity } from './infrastructure/persistence/customer.orm-entity';
import { CustomerTypeOrmRepository } from './infrastructure/persistence/customer.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomerController],
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerTypeOrmRepository },
    CreateCustomerUseCase,
  ],
  exports: [CreateCustomerUseCase],
})
export class CustomerModule {}
