import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DELIVERY_REPOSITORY } from './domain/ports/delivery-repository.port';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { DeliveryController } from './infrastructure/http/delivery.controller';
import { DeliveryOrmEntity } from './infrastructure/persistence/delivery.orm-entity';
import { DeliveryTypeOrmRepository } from './infrastructure/persistence/delivery.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  controllers: [DeliveryController],
  providers: [
    { provide: DELIVERY_REPOSITORY, useClass: DeliveryTypeOrmRepository },
    CreateDeliveryUseCase,
  ],
  exports: [CreateDeliveryUseCase],
})
export class DeliveryModule {}
