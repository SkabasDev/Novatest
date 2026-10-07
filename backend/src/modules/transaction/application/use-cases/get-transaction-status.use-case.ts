import { Inject, Injectable } from '@nestjs/common';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string): Promise<Result<Transaction, DomainError>> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      return Result.fail(new DomainError(DomainErrorCode.NOT_FOUND, `Transaction ${transactionId} was not found`));
    }

    return Result.ok(transaction);
  }
}
