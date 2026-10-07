import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Injectable()
export class TransactionTypeOrmRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity) private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const row = await this.repository.findOne({ where: { reference } });
    return row ? this.toDomain(row) : null;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const row = this.toOrmEntity(transaction);
    const saved = await this.repository.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: TransactionOrmEntity): Transaction {
    return Transaction.restore({
      id: row.id,
      reference: row.reference,
      productId: row.productId,
      customerId: row.customerId,
      amountInCents: row.amountInCents,
      baseFeeInCents: row.baseFeeInCents,
      deliveryFeeInCents: row.deliveryFeeInCents,
      status: row.status,
      providerTransactionId: row.providerTransactionId,
      cardLast4: row.cardLast4,
      cardBrand: row.cardBrand,
    });
  }

  private toOrmEntity(transaction: Transaction): TransactionOrmEntity {
    const row = new TransactionOrmEntity();
    row.id = transaction.id;
    row.reference = transaction.reference;
    row.productId = transaction.productId;
    row.customerId = transaction.customerId;
    row.amountInCents = transaction.amountInCents;
    row.baseFeeInCents = transaction.baseFeeInCents;
    row.deliveryFeeInCents = transaction.deliveryFeeInCents;
    row.status = transaction.status;
    row.providerTransactionId = transaction.providerTransactionId;
    row.cardLast4 = transaction.cardLast4;
    row.cardBrand = transaction.cardBrand;
    return row;
  }
}
