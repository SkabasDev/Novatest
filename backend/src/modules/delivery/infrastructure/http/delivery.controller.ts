import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../auth/infrastructure/http/current-user.decorator';
import { OptionalAuthGuard } from '../../../auth/infrastructure/http/optional-auth.guard';
import { SaveDefaultDeliveryUseCase } from '../../../auth/application/use-cases/save-default-delivery.use-case';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from '../../application/dto/create-delivery.dto';
import { DeliveryResponseDto } from '../../application/dto/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly saveDefaultDeliveryUseCase: SaveDefaultDeliveryUseCase,
  ) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiCreatedResponse({ type: DeliveryResponseDto })
  async create(
    @Body() dto: CreateDeliveryDto,
    @CurrentUser() user: { id: string } | undefined,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.createDeliveryUseCase.execute(dto);

    // Signed-in only — a guest checkout has no profile to prefill next time (spec §11.7).
    if (user) {
      await this.saveDefaultDeliveryUseCase.execute(user.id, delivery.address, delivery.city);
    }

    return DeliveryResponseDto.fromDomain(delivery);
  }
}
