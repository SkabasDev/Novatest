import { DomainError } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';

export interface ChargeCard {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface ChargeRequest {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  card: ChargeCard;
}

export interface ChargeResult {
  providerTransactionId: string;
  status: 'APPROVED' | 'DECLINED';
  cardLast4: string;
  cardBrand: string;
}

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

/** Driven port: the domain only knows this contract, never the concrete payment provider SDK/HTTP client. */
export interface PaymentGatewayPort {
  charge(request: ChargeRequest): Promise<Result<ChargeResult, DomainError>>;
}
