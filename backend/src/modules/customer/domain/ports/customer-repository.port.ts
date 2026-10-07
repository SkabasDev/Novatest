import { Customer } from '../customer.entity';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface CustomerRepositoryPort {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
}
