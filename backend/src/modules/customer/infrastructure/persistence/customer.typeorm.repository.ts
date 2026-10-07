import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { Customer } from '../../domain/customer.entity';
import { CustomerOrmEntity } from './customer.orm-entity';

@Injectable()
export class CustomerTypeOrmRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity) private readonly repository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const row = await this.repository.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const row = this.toOrmEntity(customer);
    const saved = await this.repository.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: CustomerOrmEntity): Customer {
    return Customer.create({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      documentId: row.documentId,
    });
  }

  private toOrmEntity(customer: Customer): CustomerOrmEntity {
    const row = new CustomerOrmEntity();
    row.id = customer.id;
    row.fullName = customer.fullName;
    row.email = customer.email;
    row.phone = customer.phone;
    row.documentId = customer.documentId;
    return row;
  }
}
