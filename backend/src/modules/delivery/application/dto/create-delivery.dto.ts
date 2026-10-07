import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionReference: string;

  @ApiProperty()
  @IsString()
  @Length(5, 150)
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty()
  @IsString()
  @Length(3, 10)
  postalCode: string;
}
