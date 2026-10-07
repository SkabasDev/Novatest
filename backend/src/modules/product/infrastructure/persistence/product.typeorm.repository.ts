import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

/** Adapter: translates between the domain Product and the TypeORM-mapped row. */
@Injectable()
export class ProductTypeOrmRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity) private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.repository.find();
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(product: Product): Promise<Product> {
    const row = this.toOrmEntity(product);
    const saved = await this.repository.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: ProductOrmEntity): Product {
    return Product.create({
      id: row.id,
      name: row.name,
      description: row.description,
      priceInCents: row.priceInCents,
      currency: row.currency,
      stock: row.stock,
      imageUrl: row.imageUrl,
    });
  }

  private toOrmEntity(product: Product): ProductOrmEntity {
    const row = new ProductOrmEntity();
    row.id = product.id;
    row.name = product.name;
    row.description = product.description;
    row.priceInCents = product.priceInCents;
    row.currency = product.currency;
    row.stock = product.stock;
    row.imageUrl = product.imageUrl;
    return row;
  }
}
