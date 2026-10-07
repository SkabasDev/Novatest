import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() priceInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty() stock: number;
  @ApiProperty() imageUrl: string;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.priceInCents = product.priceInCents;
    dto.currency = product.currency;
    dto.stock = product.stock;
    dto.imageUrl = product.imageUrl;
    return dto;
  }
}
