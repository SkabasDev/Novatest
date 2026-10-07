import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { GetProductByIdUseCase } from '../../../product/application/use-cases/get-product-by-id.use-case';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Result<Transaction, DomainError>> {
    const productResult = await this.getProductByIdUseCase.execute(dto.productId);

    if (productResult.isFail) {
      return Result.fail(productResult.getError());
    }

    const product = productResult.getValue();

    if (!product.hasStockFor(dto.quantity)) {
      return Result.fail(
        new DomainError(DomainErrorCode.INSUFFICIENT_STOCK, `Product ${product.id} has insufficient stock`, {
          available: product.stock,
          requested: dto.quantity,
        }),
      );
    }

    const baseFeeInCents = this.configService.get<number>('BASE_FEE_IN_CENTS', 0);

    const transaction = Transaction.createPending({
      id: randomUUID(),
      reference: `nova-${Date.now()}-${randomUUID().slice(0, 8)}`,
      productId: product.id,
      customerId: dto.customerId,
      amountInCents: product.priceInCents * dto.quantity,
      baseFeeInCents,
      deliveryFeeInCents: dto.deliveryFeeInCents,
      cardLast4: null,
      cardBrand: null,
    });

    const saved = await this.transactionRepository.save(transaction);
    return Result.ok(saved);
  }
}
