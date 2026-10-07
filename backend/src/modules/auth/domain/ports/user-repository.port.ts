import { User } from '../user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
