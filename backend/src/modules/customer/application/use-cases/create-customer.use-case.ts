import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CUSTOMER_REPOSITORY, CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { Customer } from '../../domain/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  /** Upserts by email: a returning customer updates their data instead of duplicating records. */
  async execute(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findByEmail(dto.email);

    const customer = Customer.create({
      id: existing?.id ?? randomUUID(),
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      documentId: dto.documentId,
    });

    return this.customerRepository.save(customer);
  }
}
