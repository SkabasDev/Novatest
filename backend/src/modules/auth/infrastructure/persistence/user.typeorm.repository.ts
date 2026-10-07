import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserTypeOrmRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity) private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const row = this.toOrmEntity(user);
    const saved = await this.repository.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: UserOrmEntity): User {
    return User.create({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      passwordHash: row.passwordHash,
      phone: row.phone,
      documentId: row.documentId,
      defaultAddress: row.defaultAddress,
      defaultCity: row.defaultCity,
    });
  }

  private toOrmEntity(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.fullName = user.fullName;
    row.email = user.email;
    row.passwordHash = user.passwordHash;
    row.phone = user.phone;
    row.documentId = user.documentId;
    row.defaultAddress = user.defaultAddress;
    row.defaultCity = user.defaultCity;
    return row;
  }
}
