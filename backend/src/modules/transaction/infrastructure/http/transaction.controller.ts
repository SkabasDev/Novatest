import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { domainErrorToHttp } from '../../../shared-kernel/domain-error-to-http';
import { CreatePendingTransactionUseCase } from '../../application/use-cases/create-pending-transaction.use-case';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { PayTransactionDto } from '../../application/dto/pay-transaction.dto';
import { TransactionResponseDto } from '../../application/dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createPendingTransactionUseCase: CreatePendingTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: TransactionResponseDto })
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const result = await this.createPendingTransactionUseCase.execute(dto);

    return result.match(
      (transaction) => TransactionResponseDto.fromDomain(transaction),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }

  @Post(':id/pay')
  @ApiOkResponse({ type: TransactionResponseDto })
  async pay(@Param('id') id: string, @Body() dto: PayTransactionDto): Promise<TransactionResponseDto> {
    const result = await this.processPaymentUseCase.execute(id, dto.customerEmail, dto);

    return result.match(
      (transaction) => TransactionResponseDto.fromDomain(transaction),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: TransactionResponseDto })
  async findById(@Param('id') id: string): Promise<TransactionResponseDto> {
    const result = await this.getTransactionStatusUseCase.execute(id);

    return result.match(
      (transaction) => TransactionResponseDto.fromDomain(transaction),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }
}
