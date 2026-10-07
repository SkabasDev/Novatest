import { ApiProperty } from '@nestjs/swagger';
import { IsCreditCard, IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PayTransactionDto {
  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Full card number, sandbox/test data only' })
  @IsCreditCard()
  cardNumber: string;

  @ApiProperty()
  @IsString()
  @Length(3, 4)
  @Matches(/^\d+$/)
  cvc: string;

  @ApiProperty({ example: '09' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/)
  expMonth: string;

  @ApiProperty({ example: '29' })
  @IsString()
  @Matches(/^\d{2}$/)
  expYear: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardHolder: string;
}
