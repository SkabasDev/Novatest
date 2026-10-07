import { DecrementStockUseCase } from '../../../product/application/use-cases/decrement-stock.use-case';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';
import { PayTransactionDto } from '../dto/pay-transaction.dto';
import { ProcessPaymentUseCase } from './process-payment.use-case';

describe('ProcessPaymentUseCase', () => {
  const pendingTransaction = () =>
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

  const card: PayTransactionDto = {
    customerEmail: 'jane@example.com',
    cardNumber: '4242424242424242',
    cvc: '123',
    expMonth: '09',
    expYear: '29',
    cardHolder: 'Jane Doe',
  };

  function buildDeps(transaction: Transaction | null) {
    const transactionRepository: TransactionRepositoryPort = {
      findById: jest.fn().mockResolvedValue(transaction),
      findByReference: jest.fn(),
      save: jest.fn().mockImplementation((t: Transaction) => Promise.resolve(t)),
    };
    const decrementStockUseCase = { execute: jest.fn().mockResolvedValue(Result.ok({})) } as unknown as DecrementStockUseCase;
    return { transactionRepository, decrementStockUseCase };
  }

  it('approves the transaction and decrements stock when the gateway approves the charge', async () => {
    const { transactionRepository, decrementStockUseCase } = buildDeps(pendingTransaction());
    const paymentGateway: PaymentGatewayPort = {
      charge: jest.fn().mockResolvedValue(
        Result.ok({ providerTransactionId: 'prov-1', status: 'APPROVED', cardLast4: '4242', cardBrand: 'VISA' }),
      ),
    };
    const useCase = new ProcessPaymentUseCase(transactionRepository, paymentGateway, decrementStockUseCase);

    const result = await useCase.execute('tx-1', card.customerEmail, card);

    expect(result.isOk).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.APPROVED);
    expect(decrementStockUseCase.execute).toHaveBeenCalledWith('p-1', 1);
    expect(transactionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('declines the transaction without decrementing stock when the gateway declines the charge', async () => {
    const { transactionRepository, decrementStockUseCase } = buildDeps(pendingTransaction());
    const paymentGateway: PaymentGatewayPort = {
      charge: jest.fn().mockResolvedValue(
        Result.ok({ providerTransactionId: 'prov-2', status: 'DECLINED', cardLast4: '4242', cardBrand: 'VISA' }),
      ),
    };
    const useCase = new ProcessPaymentUseCase(transactionRepository, paymentGateway, decrementStockUseCase);

    const result = await useCase.execute('tx-1', card.customerEmail, card);

    expect(result.isOk).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.DECLINED);
    expect(decrementStockUseCase.execute).not.toHaveBeenCalled();
  });

  it('marks the transaction as ERROR when the gateway is unreachable', async () => {
    const { transactionRepository, decrementStockUseCase } = buildDeps(pendingTransaction());
    const paymentGateway: PaymentGatewayPort = {
      charge: jest
        .fn()
        .mockResolvedValue(Result.fail(new DomainError(DomainErrorCode.PAYMENT_GATEWAY_UNAVAILABLE, 'down'))),
    };
    const useCase = new ProcessPaymentUseCase(transactionRepository, paymentGateway, decrementStockUseCase);

    const result = await useCase.execute('tx-1', card.customerEmail, card);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.PAYMENT_GATEWAY_UNAVAILABLE);
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ status: TransactionStatus.ERROR }) }),
    );
  });

  it('fails with NOT_FOUND when the transaction does not exist', async () => {
    const { transactionRepository, decrementStockUseCase } = buildDeps(null);
    const paymentGateway: PaymentGatewayPort = { charge: jest.fn() };
    const useCase = new ProcessPaymentUseCase(transactionRepository, paymentGateway, decrementStockUseCase);

    const result = await useCase.execute('missing-tx', card.customerEmail, card);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
    expect(paymentGateway.charge).not.toHaveBeenCalled();
  });

  it('fails with INVALID_TRANSACTION_STATE when the transaction is not pending', async () => {
    const approved = pendingTransaction().markApproved('prov-prev').getValue();
    const { transactionRepository, decrementStockUseCase } = buildDeps(approved);
    const paymentGateway: PaymentGatewayPort = { charge: jest.fn() };
    const useCase = new ProcessPaymentUseCase(transactionRepository, paymentGateway, decrementStockUseCase);

    const result = await useCase.execute('tx-1', card.customerEmail, card);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INVALID_TRANSACTION_STATE);
    expect(paymentGateway.charge).not.toHaveBeenCalled();
  });
});
