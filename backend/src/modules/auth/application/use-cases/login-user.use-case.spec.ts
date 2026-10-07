import { DomainErrorCode } from '../../../shared-kernel/domain-error';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { LoginUserUseCase } from './login-user.use-case';

describe('LoginUserUseCase', () => {
  const dto = { email: 'jane@example.com', password: 'secret123' };
  const existingUser = User.create({
    id: 'u-1',
    fullName: 'Jane Doe',
    email: dto.email,
    passwordHash: 'hashed',
    phone: '3001234567',
    documentId: '1234567890',
    defaultAddress: null,
    defaultCity: null,
  });

  function buildDeps(user: User | null, passwordMatches: boolean) {
    const userRepository: UserRepositoryPort = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
      save: jest.fn(),
    };
    const passwordHasher: PasswordHasherPort = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(passwordMatches),
    };
    const tokenService: TokenServicePort = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn(),
    };
    return { userRepository, passwordHasher, tokenService };
  }

  it('signs a token on valid credentials', async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps(existingUser, true);
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute(dto);

    expect(result.isOk).toBe(true);
    expect(result.getValue().token).toBe('signed-token');
    expect(tokenService.sign).toHaveBeenCalledWith({ sub: 'u-1', email: dto.email });
  });

  it('fails with INVALID_CREDENTIALS when the user does not exist', async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps(null, false);
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute(dto);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INVALID_CREDENTIALS);
  });

  it('fails with INVALID_CREDENTIALS when the password does not match, without revealing which field was wrong', async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps(existingUser, false);
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute(dto);

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.INVALID_CREDENTIALS);
    expect(result.getError().message).toBe('Email or password do not match');
  });
});
