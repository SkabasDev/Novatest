import { Inject, Injectable } from '@nestjs/common';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { LoginDto } from '../dto/login.dto';

/** Deliberately vague on failure (never says which of email/password was wrong) — spec §11.5. */
const INVALID_CREDENTIALS_MESSAGE = 'Email or password do not match';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(dto: LoginDto): Promise<Result<{ user: User; token: string }, DomainError>> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return Result.fail(new DomainError(DomainErrorCode.INVALID_CREDENTIALS, INVALID_CREDENTIALS_MESSAGE));
    }

    const passwordMatches = await this.passwordHasher.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      return Result.fail(new DomainError(DomainErrorCode.INVALID_CREDENTIALS, INVALID_CREDENTIALS_MESSAGE));
    }

    const token = this.tokenService.sign({ sub: user.id, email: user.email });
    return Result.ok({ user, token });
  }
}
