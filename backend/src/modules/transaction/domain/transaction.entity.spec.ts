import { DomainErrorCode } from '../../shared-kernel/domain-error';
import { Transaction, TransactionStatus } from './transaction.entity';

describe('Transaction entity', () => {
  const buildPending = () =>
    Transaction.createPending({
      id: 'tx-1',
      reference: 'ref-1',
      productId: 'p-1',
      customerId: 'c-1',
      amountInCents: 10000,
      baseFeeInCents: 3500,
      deliveryFeeInCents: 1500,
      cardLast4: null,
      cardBrand: null,
    });

  it('starts in PENDING status and computes the total correctly', () => {
    const transaction = buildPending();
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.totalInCents).toBe(15000);
    expect(transaction.isPending).toBe(true);
  });

  it('transitions PENDING -> APPROVED storing the provider transaction id', () => {
    const transaction = buildPending();
    const result = transaction.markApproved('provider-tx-123');

    expect(result.isOk).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.APPROVED);
    expect(result.getValue().providerTransactionId).toBe('provider-tx-123');
  });

  it('transitions PENDING -> DECLINED', () => {
    const transaction = buildPending();
    const result = transaction.markDeclined('provider-tx-456');

    expect(result.isOk).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.DECLINED);
  });

  it('transitions PENDING -> ERROR', () => {
    const transaction = buildPending();
    const result = transaction.markError();

    expect(result.isOk).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.ERROR);
  });

  it('rejects transitioning out of a terminal state', () => {
    const approved = buildPending().markApproved('provider-tx-123').getValue();
    const result = approved.markDeclined('provider-tx-999');

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INVALID_TRANSACTION_STATE);
  });

  it('does not mutate the original instance on transition', () => {
    const transaction = buildPending();
    transaction.markApproved('provider-tx-123');

    expect(transaction.status).toBe(TransactionStatus.PENDING);
  });
});
