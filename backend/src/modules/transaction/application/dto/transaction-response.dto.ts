import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() reference: string;
  @ApiProperty() productId: string;
  @ApiProperty() customerId: string;
  @ApiProperty() amountInCents: number;
  @ApiProperty() baseFeeInCents: number;
  @ApiProperty() deliveryFeeInCents: number;
  @ApiProperty() totalInCents: number;
  @ApiProperty({ enum: TransactionStatus }) status: TransactionStatus;
  @ApiProperty({ nullable: true }) cardLast4: string | null;
  @ApiProperty({ nullable: true }) cardBrand: string | null;

  static fromDomain(transaction: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = transaction.id;
    dto.reference = transaction.reference;
    dto.productId = transaction.productId;
    dto.customerId = transaction.customerId;
    dto.amountInCents = transaction.amountInCents;
    dto.baseFeeInCents = transaction.baseFeeInCents;
    dto.deliveryFeeInCents = transaction.deliveryFeeInCents;
    dto.totalInCents = transaction.totalInCents;
    dto.status = transaction.status;
    dto.cardLast4 = transaction.cardLast4;
    dto.cardBrand = transaction.cardBrand;
    return dto;
  }
}
