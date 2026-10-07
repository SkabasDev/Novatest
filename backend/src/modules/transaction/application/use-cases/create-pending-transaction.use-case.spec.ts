import { ConfigService } from '@nestjs/config';
import { CreateCustomerUseCase } from '../../../customer/application/use-cases/create-customer.use-case';
import { Customer } from '../../../customer/domain/customer.entity';
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

  const guestContact = { fullName: 'Jane Doe', email: 'jane@example.com', phone: '3001234567', documentId: '1234567890' };

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
    const createCustomerUseCase = {
      execute: jest.fn().mockResolvedValue(Customer.create({ id: 'guest-1', ...guestContact })),
    } as unknown as CreateCustomerUseCase;
    const configService = { get: jest.fn().mockReturnValue(3500) } as unknown as ConfigService;
    return { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService };
  }

  const dto = { productId: 'p-1', quantity: 1, deliveryFeeInCents: 1500 };

  it('creates a PENDING transaction for an authenticated user, using the session id as customerId', async () => {
    const { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService } = buildDeps(buildProduct(5));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService);

    const result = await useCase.execute(dto, 'user-1');

    expect(result.isOk).toBe(true);
    const transaction = result.getValue();
    expect(transaction.customerId).toBe('user-1');
    expect(transaction.amountInCents).toBe(5000);
    expect(transaction.totalInCents).toBe(5000 + 3500 + 1500);
    expect(createCustomerUseCase.execute).not.toHaveBeenCalled();
  });

  it('creates a guest customer and uses it as customerId when there is no session', async () => {
    const { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService } = buildDeps(buildProduct(5));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService);

    const result = await useCase.execute({ ...dto, guestContact }, null);

    expect(result.isOk).toBe(true);
    expect(result.getValue().customerId).toBe('guest-1');
    expect(createCustomerUseCase.execute).toHaveBeenCalledWith(guestContact);
  });

  it('fails with VALIDATION_ERROR when there is no session and no guest contact', async () => {
    const { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService } = buildDeps(buildProduct(5));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService);

    const result = await useCase.execute(dto, null);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.VALIDATION_ERROR);
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('fails with INSUFFICIENT_STOCK when the product does not have enough stock', async () => {
    const { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService } = buildDeps(buildProduct(0));
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService);

    const result = await useCase.execute(dto, 'user-1');

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INSUFFICIENT_STOCK);
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('fails with NOT_FOUND when the product does not exist', async () => {
    const { transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService } = buildDeps(null);
    const useCase = new CreatePendingTransactionUseCase(transactionRepository, getProductByIdUseCase, createCustomerUseCase, configService);

    const result = await useCase.execute(dto, 'user-1');

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
  });
});
