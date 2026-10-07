import { Inject, Injectable, Logger } from '@nestjs/common';
import { DecrementStockUseCase } from '../../../product/application/use-cases/decrement-stock.use-case';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';
import { PayTransactionDto } from '../dto/pay-transaction.dto';

/**
 * Railway Oriented orchestration of the payment flow:
 * find pending tx -> charge with the gateway -> transition tx state -> persist -> decrement stock.
 * Each step short-circuits to the failure track on error, mirroring the ROP chain described in BACKEND.md.
 */
@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    private readonly decrementStockUseCase: DecrementStockUseCase,
  ) {}

  async execute(
    transactionId: string,
    customerEmail: string,
    card: PayTransactionDto,
  ): Promise<Result<Transaction, DomainError>> {
    const pendingResult = await this.getPendingTransaction(transactionId);
    if (pendingResult.isFail) return pendingResult;

    const transaction = pendingResult.getValue();

    const chargeResult = await this.paymentGateway.charge({
      reference: transaction.reference,
      amountInCents: transaction.totalInCents,
      currency: 'COP',
      customerEmail,
      card: {
        number: card.cardNumber,
        cvc: card.cvc,
        expMonth: card.expMonth,
        expYear: card.expYear,
        cardHolder: card.cardHolder,
      },
    });

    if (chargeResult.isFail) {
      await this.persistAsErrored(transaction);
      return Result.fail(chargeResult.getError());
    }

    const charge = chargeResult.getValue();
    const transitionResult =
      charge.status === 'APPROVED'
        ? transaction.withCard(charge.cardLast4, charge.cardBrand).markApproved(charge.providerTransactionId)
        : transaction.withCard(charge.cardLast4, charge.cardBrand).markDeclined(charge.providerTransactionId);

    if (transitionResult.isFail) return transitionResult;

    const settledTransaction = transitionResult.getValue();
    const saved = await this.transactionRepository.save(settledTransaction);

    if (saved.status === TransactionStatus.APPROVED) {
      const stockResult = await this.decrementStockUseCase.execute(saved.productId, 1);
      if (stockResult.isFail) {
        this.logger.error(
          `Payment approved for transaction ${saved.id} but stock decrement failed: ${stockResult.getError().message}`,
        );
      }
    }

    return Result.ok(saved);
  }

  private async getPendingTransaction(transactionId: string): Promise<Result<Transaction, DomainError>> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      return Result.fail(new DomainError(DomainErrorCode.NOT_FOUND, `Transaction ${transactionId} was not found`));
    }

    if (!transaction.isPending) {
      return Result.fail(
        new DomainError(DomainErrorCode.INVALID_TRANSACTION_STATE, `Transaction ${transactionId} is not pending`),
      );
    }

    return Result.ok(transaction);
  }

  private async persistAsErrored(transaction: Transaction): Promise<void> {
    const errored = transaction.markError();
    if (errored.isOk) {
      await this.transactionRepository.save(errored.getValue());
    }
  }
}
