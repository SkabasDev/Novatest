import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { SaveDefaultDeliveryUseCase } from './save-default-delivery.use-case';

describe('SaveDefaultDeliveryUseCase', () => {
  const user = User.create({
    id: 'u-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hash',
    phone: '3001234567',
    documentId: '1234567890',
    defaultAddress: null,
    defaultCity: null,
  });

  it('saves the delivery as the default on the user', async () => {
    const userRepository: UserRepositoryPort = {
      findById: jest.fn().mockResolvedValue(user),
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((u: User) => Promise.resolve(u)),
    };
    const useCase = new SaveDefaultDeliveryUseCase(userRepository);

    await useCase.execute('u-1', 'Calle 123', 'Bogotá');

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const saved = (userRepository.save as jest.Mock).mock.calls[0][0] as User;
    expect(saved.defaultAddress).toBe('Calle 123');
    expect(saved.defaultCity).toBe('Bogotá');
  });

  it('no-ops silently when the user does not exist', async () => {
    const userRepository: UserRepositoryPort = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new SaveDefaultDeliveryUseCase(userRepository);

    await useCase.execute('missing', 'Calle 123', 'Bogotá');

    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
