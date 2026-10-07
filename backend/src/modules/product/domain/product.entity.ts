import { DomainError, DomainErrorCode } from '../../shared-kernel/domain-error';
import { Result } from '../../shared-kernel/result';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string;
}

/** Pure domain entity — no decorators, no persistence or HTTP concerns. */
export class Product {
  private constructor(private props: ProductProps) {}

  static create(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get stock(): number {
    return this.props.stock;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  hasStockFor(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  /** Returns a new Product instance with stock decremented — never mutates in place. */
  decrementStock(quantity: number): Result<Product, DomainError> {
    if (quantity <= 0) {
      return Result.fail(
        new DomainError(DomainErrorCode.VALIDATION_ERROR, 'Quantity must be greater than zero'),
      );
    }

    if (!this.hasStockFor(quantity)) {
      return Result.fail(
        new DomainError(DomainErrorCode.INSUFFICIENT_STOCK, `Product ${this.props.id} has insufficient stock`, {
          available: this.props.stock,
          requested: quantity,
        }),
      );
    }

    return Result.ok(Product.create({ ...this.props, stock: this.props.stock - quantity }));
  }
}
