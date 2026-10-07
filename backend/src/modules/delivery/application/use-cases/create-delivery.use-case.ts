import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DELIVERY_REPOSITORY, DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port';
import { Delivery } from '../../domain/delivery.entity';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY) private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = Delivery.create({ id: randomUUID(), ...dto });
    return this.deliveryRepository.save(delivery);
  }
}
