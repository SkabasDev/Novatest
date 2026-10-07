import { ApiProperty } from '@nestjs/swagger';
import { Delivery } from '../../domain/delivery.entity';

export class DeliveryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() customerId: string;
  @ApiProperty() transactionReference: string;
  @ApiProperty() address: string;
  @ApiProperty() city: string;
  @ApiProperty() region: string;
  @ApiProperty() postalCode: string;

  static fromDomain(delivery: Delivery): DeliveryResponseDto {
    const dto = new DeliveryResponseDto();
    dto.id = delivery.id;
    dto.customerId = delivery.customerId;
    dto.transactionReference = delivery.transactionReference;
    dto.address = delivery.address;
    dto.city = delivery.city;
    dto.region = delivery.region;
    dto.postalCode = delivery.postalCode;
    return dto;
  }
}
