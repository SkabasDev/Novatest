import { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port';
import { Delivery } from '../../domain/delivery.entity';
import { CreateDeliveryUseCase } from './create-delivery.use-case';

describe('CreateDeliveryUseCase', () => {
  it('creates and persists a delivery with a generated id', async () => {
    const repository: DeliveryRepositoryPort = {
      findByTransactionReference: jest.fn(),
      save: jest.fn().mockImplementation((d: Delivery) => Promise.resolve(d)),
    };
    const useCase = new CreateDeliveryUseCase(repository);

    const dto = {
      customerId: 'customer-1',
      transactionReference: 'tx-ref-1',
      address: '123 Main St',
      city: 'Bogotá',
      region: 'Cundinamarca',
      postalCode: '110111',
    };

    const delivery = await useCase.execute(dto);

    expect(delivery.id).toBeDefined();
    expect(delivery.transactionReference).toBe('tx-ref-1');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
