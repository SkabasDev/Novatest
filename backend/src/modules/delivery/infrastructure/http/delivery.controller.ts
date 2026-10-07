import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from '../../application/dto/create-delivery.dto';
import { DeliveryResponseDto } from '../../application/dto/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly createDeliveryUseCase: CreateDeliveryUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: DeliveryResponseDto })
  async create(@Body() dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    const delivery = await this.createDeliveryUseCase.execute(dto);
    return DeliveryResponseDto.fromDomain(delivery);
  }
}
