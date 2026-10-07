import { DomainErrorCode } from '../../../shared-kernel/domain-error';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { GetProfileUseCase } from './get-profile.use-case';

describe('GetProfileUseCase', () => {
  it('returns the user when found', async () => {
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
    const userRepository: UserRepositoryPort = {
      findById: jest.fn().mockResolvedValue(user),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new GetProfileUseCase(userRepository);

    const result = await useCase.execute('u-1');

    expect(result.isOk).toBe(true);
    expect(result.getValue().id).toBe('u-1');
  });

  it('fails with NOT_FOUND when the user does not exist', async () => {
    const userRepository: UserRepositoryPort = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new GetProfileUseCase(userRepository);

    const result = await useCase.execute('missing');

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.NOT_FOUND);
  });
});
