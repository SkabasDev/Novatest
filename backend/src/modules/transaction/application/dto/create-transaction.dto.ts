import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  deliveryFeeInCents: number;
}
