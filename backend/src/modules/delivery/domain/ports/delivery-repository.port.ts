import { Delivery } from '../delivery.entity';

export const DELIVERY_REPOSITORY = 'DELIVERY_REPOSITORY';

export interface DeliveryRepositoryPort {
  findByTransactionReference(reference: string): Promise<Delivery | null>;
  save(delivery: Delivery): Promise<Delivery>;
}
