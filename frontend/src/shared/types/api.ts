export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string;
  /** Not yet modeled on the backend — optional so the UI degrades gracefully with a generic overline. */
  category?: string;
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionDto {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
  status: TransactionStatus;
  cardLast4: string | null;
  cardBrand: string | null;
}
