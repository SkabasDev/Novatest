import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';

/** Called after an approved payment so the next purchase can prefill delivery (spec §11.7). Silently no-ops for unknown users — never blocks a completed payment. */
@Injectable()
export class SaveDefaultDeliveryUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string, address: string, city: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    await this.userRepository.save(user.withDefaultDelivery(address, city));
  }
}
