import { Inject, Injectable } from '@nestjs/common';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<Result<User, DomainError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail(new DomainError(DomainErrorCode.NOT_FOUND, `User ${userId} was not found`));
    }

    return Result.ok(user);
  }
}
