import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { Customer } from '../../domain/customer.entity';
import { CreateCustomerUseCase } from './create-customer.use-case';

describe('CreateCustomerUseCase', () => {
  function buildRepository(existing: Customer | null): CustomerRepositoryPort {
    return {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockImplementation((c: Customer) => Promise.resolve(c)),
    };
  }

  const dto = { fullName: 'Jane Doe', email: 'jane@example.com', phone: '3001234567', documentId: '1234567890' };

  it('creates a new customer with a generated id when none exists', async () => {
    const repository = buildRepository(null);
    const useCase = new CreateCustomerUseCase(repository);

    const customer = await useCase.execute(dto);

    expect(customer.id).toBeDefined();
    expect(customer.email).toBe(dto.email);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing id when the customer already exists (upsert by email)', async () => {
    const existing = Customer.create({ id: 'existing-id', ...dto });
    const repository = buildRepository(existing);
    const useCase = new CreateCustomerUseCase(repository);

    const customer = await useCase.execute({ ...dto, fullName: 'Jane D.' });

    expect(customer.id).toBe('existing-id');
    expect(customer.fullName).toBe('Jane D.');
  });
});
