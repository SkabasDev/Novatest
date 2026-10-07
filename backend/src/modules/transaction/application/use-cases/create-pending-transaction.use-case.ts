import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { CreateCustomerUseCase } from '../../../customer/application/use-cases/create-customer.use-case';
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
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly configService: ConfigService,
  ) {}

  /**
   * `authenticatedUserId` comes from an optional-auth guard at the controller — null for a guest
   * checkout, which must then carry `dto.guestContact` (spec v3 §12.7: session OR guest contact).
   */
  async execute(
    dto: CreateTransactionDto,
    authenticatedUserId: string | null,
  ): Promise<Result<Transaction, DomainError>> {
    const customerIdResult = await this.resolveCustomerId(dto, authenticatedUserId);
    if (customerIdResult.isFail) {
      return Result.fail(customerIdResult.getError());
    }

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
      customerId: customerIdResult.getValue(),
      amountInCents: product.priceInCents * dto.quantity,
      baseFeeInCents,
      deliveryFeeInCents: dto.deliveryFeeInCents,
      cardLast4: null,
      cardBrand: null,
    });

    const saved = await this.transactionRepository.save(transaction);
    return Result.ok(saved);
  }

  private async resolveCustomerId(
    dto: CreateTransactionDto,
    authenticatedUserId: string | null,
  ): Promise<Result<string, DomainError>> {
    if (authenticatedUserId) {
      return Result.ok(authenticatedUserId);
    }

    if (!dto.guestContact) {
      return Result.fail(
        new DomainError(
          DomainErrorCode.VALIDATION_ERROR,
          'Guest checkout requires contact info (fullName, email, phone, documentId) when there is no session',
        ),
      );
    }

    const guest = await this.createCustomerUseCase.execute(dto.guestContact);
    return Result.ok(guest.id);
  }
}
