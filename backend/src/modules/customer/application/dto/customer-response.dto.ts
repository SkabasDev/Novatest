import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../domain/customer.entity';

export class CustomerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() documentId: string;

  static fromDomain(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.fullName = customer.fullName;
    dto.email = customer.email;
    dto.phone = customer.phone;
    dto.documentId = customer.documentId;
    return dto;
  }
}
