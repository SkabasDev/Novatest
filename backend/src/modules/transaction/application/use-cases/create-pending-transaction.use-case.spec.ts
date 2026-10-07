import { ConfigService } from '@nestjs/config';
import { GetProductByIdUseCase } from '../../../product/application/use-cases/get-product-by-id.use-case';
import { Product } from '../../../product/domain/product.entity';
import { DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { CreatePendingTransactionUseCase } from './create-pending-transaction.use-case';

describe('CreatePendingTransactionUseCase', () => {
  const buildProduct = (stock: number) =>
    Product.create({ id: 'p-1', name: 'Headphones', description: 'desc', priceInCents: 5000, currency: 'COP', stock, imageUrl: 'img.png' });

  function buildDeps(product: Product | null) {
    const transactionRepository: TransactionRepositoryPort = {
      findById: jest.fn(),
      findByReference: jest.fn(),
      save: jest.fn().mockImplementation((t: Transaction) => Promise.resolve(t)),
    };
    const getProductByIdUseCase = {
      execute: jest.fn().mockResolvedValue(
        product
          ? Result.ok(product)
          : Result.fail({ code: DomainErrorCode.NOT_FOUND, message: 'not found' }),
      ),
    } as unknown as GetProductByIdUseCase;
    const configService = { get: jest.fn().mockReturnValue(3500) } as unknown as ConfigService;
    return { transactionRepository, getProductByIdUseCase, configService };
  }

  const dto = { productId: 'p-1', customerId: 'c-1', quantity: 1, deliveryFeeInCents: 1500 };

  it('creates a PENDING transaction with amount computed from the product price', async () => {
    const { transactionRepository, getProductByIdUseCase, configService } = buildDeps(buildProduct(5));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, configService);

    const result = await useCase.execute(dto);

    expect(result.isOk).toBe(true);
    const transaction = result.getValue();
    expect(transaction.amountInCents).toBe(5000);
    expect(transaction.baseFeeInCents).toBe(3500);
    expect(transaction.totalInCents).toBe(5000 + 3500 + 1500);
  });

  it('fails with INSUFFICIENT_STOCK when the product does not have enough stock', async () => {
    const { transactionRepository, getProductByIdUseCase, configService } = buildDeps(buildProduct(0));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, configService);

    const result = await useCase.execute(dto);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INSUFFICIENT_STOCK);
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('fails with NOT_FOUND when the product does not exist', async () => {
    const { transactionRepository, getProductByIdUseCase, configService } = buildDeps(null);
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, configService);

    const result = await useCase.execute(dto);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
  });
});
