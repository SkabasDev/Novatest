import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TransactionStatus } from '../../domain/transaction.entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ name: 'provider_transaction_id', nullable: true })
  providerTransactionId: string | null;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'amount_in_cents', type: 'int' })
  amountInCents: number;

  @Column({ name: 'base_fee_in_cents', type: 'int' })
  baseFeeInCents: number;

  @Column({ name: 'delivery_fee_in_cents', type: 'int' })
  deliveryFeeInCents: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ name: 'card_last4', nullable: true })
  cardLast4: string | null;

  @Column({ name: 'card_brand', nullable: true })
  cardBrand: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
