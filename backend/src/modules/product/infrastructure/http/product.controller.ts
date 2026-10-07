import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductResponseDto } from '../../application/dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: [ProductResponseDto] })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.getProductsUseCase.execute();
    return products.map((product) => ProductResponseDto.fromDomain(product));
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    const result = await this.getProductByIdUseCase.execute(id);

    return result.match(
      (product) => ProductResponseDto.fromDomain(product),
      (error) => {
        throw new NotFoundException(error.message);
      },
    );
  }
}
