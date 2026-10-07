import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';
import { ProductModule } from '../product/product.module';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction-repository.port';
import { CreatePendingTransactionUseCase } from './application/use-cases/create-pending-transaction.use-case';
import { GetTransactionStatusUseCase } from './application/use-cases/get-transaction-status.use-case';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { TransactionController } from './infrastructure/http/transaction.controller';
import { PaymentGatewayAdapter } from './infrastructure/payment/payment-gateway.adapter';
import { TransactionOrmEntity } from './infrastructure/persistence/transaction.orm-entity';
import { TransactionTypeOrmRepository } from './infrastructure/persistence/transaction.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity]), ProductModule, CustomerModule, AuthModule],
  controllers: [TransactionController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionTypeOrmRepository },
    { provide: PAYMENT_GATEWAY, useClass: PaymentGatewayAdapter },
    CreatePendingTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionStatusUseCase,
  ],
})
export class TransactionModule {}
