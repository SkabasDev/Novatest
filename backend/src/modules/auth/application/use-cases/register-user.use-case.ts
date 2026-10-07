import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  /** Registering signs the user in immediately (spec §11.6: "Al éxito inicia sesión automáticamente"). */
  async execute(dto: RegisterUserDto): Promise<Result<{ user: User; token: string }, DomainError>> {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      return Result.fail(
        new DomainError(DomainErrorCode.EMAIL_ALREADY_EXISTS, `There is already an account with email ${dto.email}`),
      );
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = User.create({
      id: randomUUID(),
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      documentId: dto.documentId,
      defaultAddress: null,
      defaultCity: null,
    });

    const saved = await this.userRepository.save(user);
    const token = this.tokenService.sign({ sub: saved.id, email: saved.email });
    return Result.ok({ user: saved, token });
  }
}
