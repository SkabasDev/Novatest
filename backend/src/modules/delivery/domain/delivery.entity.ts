export interface DeliveryProps {
  id: string;
  customerId: string;
  transactionReference: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export class Delivery {
  private constructor(private props: DeliveryProps) {}

  static create(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get transactionReference(): string {
    return this.props.transactionReference;
  }

  get address(): string {
    return this.props.address;
  }

  get city(): string {
    return this.props.city;
  }

  get region(): string {
    return this.props.region;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }
}
