import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { CreateCustomerDto } from '../../../customer/application/dto/create-customer.dto';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  deliveryFeeInCents: number;

  @ApiProperty({
    type: CreateCustomerDto,
    required: false,
    description: 'Required when the request has no session (guest checkout, spec v3 §12.7). Ignored when authenticated.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  guestContact?: CreateCustomerDto;
}
