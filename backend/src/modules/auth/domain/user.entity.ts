export interface UserProps {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  documentId: string;
  defaultAddress: string | null;
  defaultCity: string | null;
}

/** Pure domain entity — the password never leaves as plain text, and the hash never leaves this layer at all (see UserProfile). */
export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
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

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get phone(): string {
    return this.props.phone;
  }

  get documentId(): string {
    return this.props.documentId;
  }

  get defaultAddress(): string | null {
    return this.props.defaultAddress;
  }

  get defaultCity(): string | null {
    return this.props.defaultCity;
  }

  /** Called after an approved payment so the next purchase can prefill delivery (spec §11.7). */
  withDefaultDelivery(address: string, city: string): User {
    return new User({ ...this.props, defaultAddress: address, defaultCity: city });
  }
}
