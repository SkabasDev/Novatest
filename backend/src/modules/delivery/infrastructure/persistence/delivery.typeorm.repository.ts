import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port';
import { Delivery } from '../../domain/delivery.entity';
import { DeliveryOrmEntity } from './delivery.orm-entity';

@Injectable()
export class DeliveryTypeOrmRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryOrmEntity) private readonly repository: Repository<DeliveryOrmEntity>,
  ) {}

  async findByTransactionReference(reference: string): Promise<Delivery | null> {
    const row = await this.repository.findOne({ where: { transactionReference: reference } });
    return row ? this.toDomain(row) : null;
  }

  async save(delivery: Delivery): Promise<Delivery> {
    const row = this.toOrmEntity(delivery);
    const saved = await this.repository.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: DeliveryOrmEntity): Delivery {
    return Delivery.create({
      id: row.id,
      customerId: row.customerId,
      transactionReference: row.transactionReference,
      address: row.address,
      city: row.city,
      region: row.region,
      postalCode: row.postalCode,
    });
  }

  private toOrmEntity(delivery: Delivery): DeliveryOrmEntity {
    const row = new DeliveryOrmEntity();
    row.id = delivery.id;
    row.customerId = delivery.customerId;
    row.transactionReference = delivery.transactionReference;
    row.address = delivery.address;
    row.city = delivery.city;
    row.region = delivery.region;
    row.postalCode = delivery.postalCode;
    return row;
  }
}
