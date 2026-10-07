import { DomainErrorCode } from '../../../shared-kernel/domain-error';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  const dto = { fullName: 'Jane Doe', email: 'jane@example.com', phone: '3001234567', documentId: '1234567890', password: 'secret123' };

  function buildDeps(existing: User | null) {
    const userRepository: UserRepositoryPort = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockImplementation((u: User) => Promise.resolve(u)),
    };
    const passwordHasher: PasswordHasherPort = {
      hash: jest.fn().mockResolvedValue('hashed-secret123'),
      compare: jest.fn(),
    };
    const tokenService: TokenServicePort = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn(),
    };
    return { userRepository, passwordHasher, tokenService };
  }

  it('creates a user, hashes the password and signs a token', async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps(null);
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute(dto);

    expect(result.isOk).toBe(true);
    expect(result.getValue().token).toBe('signed-token');
    expect(result.getValue().user.email).toBe(dto.email);
    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('fails with EMAIL_ALREADY_EXISTS when the email is taken', async () => {
    const existing = User.create({
      id: 'u-1',
      fullName: 'Jane Doe',
      email: dto.email,
      passwordHash: 'hash',
      phone: dto.phone,
      documentId: dto.documentId,
      defaultAddress: null,
      defaultCity: null,
    });
    const { userRepository, passwordHasher, tokenService } = buildDeps(existing);
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute(dto);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.EMAIL_ALREADY_EXISTS);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
