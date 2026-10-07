export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
}

export class Customer {
  private constructor(private props: CustomerProps) {}

  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get documentId(): string {
    return this.props.documentId;
  }
}
