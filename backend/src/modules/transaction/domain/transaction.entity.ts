import { DomainError, DomainErrorCode } from '../../shared-kernel/domain-error';
import { Result } from '../../shared-kernel/result';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export interface TransactionProps {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  status: TransactionStatus;
  providerTransactionId: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
}

/** Pure domain entity modelling the transaction state machine: PENDING -> APPROVED | DECLINED | ERROR. */
export class Transaction {
  private constructor(private props: TransactionProps) {}

  static createPending(props: Omit<TransactionProps, 'status' | 'providerTransactionId'>): Transaction {
    return new Transaction({ ...props, status: TransactionStatus.PENDING, providerTransactionId: null });
  }

  static restore(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get productId(): string {
    return this.props.productId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get providerTransactionId(): string | null {
    return this.props.providerTransactionId;
  }

  get cardLast4(): string | null {
    return this.props.cardLast4;
  }

  get cardBrand(): string | null {
    return this.props.cardBrand;
  }

  get amountInCents(): number {
    return this.props.amountInCents;
  }

  get baseFeeInCents(): number {
    return this.props.baseFeeInCents;
  }

  get deliveryFeeInCents(): number {
    return this.props.deliveryFeeInCents;
  }

  get totalInCents(): number {
    return this.props.amountInCents + this.props.baseFeeInCents + this.props.deliveryFeeInCents;
  }

  get isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  withCard(cardLast4: string, cardBrand: string): Transaction {
    return new Transaction({ ...this.props, cardLast4, cardBrand });
  }

  markApproved(providerTransactionId: string): Result<Transaction, DomainError> {
    return this.transitionTo(TransactionStatus.APPROVED, providerTransactionId);
  }

  markDeclined(providerTransactionId: string): Result<Transaction, DomainError> {
    return this.transitionTo(TransactionStatus.DECLINED, providerTransactionId);
  }

  markError(): Result<Transaction, DomainError> {
    return this.transitionTo(TransactionStatus.ERROR, null);
  }

  private transitionTo(
    next: TransactionStatus,
    providerTransactionId: string | null,
  ): Result<Transaction, DomainError> {
    if (!this.isPending) {
      return Result.fail(
        new DomainError(
          DomainErrorCode.INVALID_TRANSACTION_STATE,
          `Transaction ${this.props.id} cannot move from ${this.props.status} to ${next}`,
        ),
      );
    }

    return Result.ok(
      new Transaction({ ...this.props, status: next, providerTransactionId: providerTransactionId ?? this.props.providerTransactionId }),
    );
  }
}
