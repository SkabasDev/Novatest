import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainError, DomainErrorCode } from '../../../shared-kernel/domain-error';
import { Result } from '../../../shared-kernel/result';
import { ChargeRequest, ChargeResult, PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

/**
 * Adapter implementing the payment-gateway port against the sandbox environment of the chosen
 * payment provider. Keeps the HTTP/SDK details out of the domain and use cases.
 *
 * TODO: replace the tokenize/charge calls below with the real sandbox endpoints and payload shape
 * of the payment provider once credentials are wired up (see backend .env.example).
 */
@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(PaymentGatewayAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async charge(request: ChargeRequest): Promise<Result<ChargeResult, DomainError>> {
    const baseUrl = this.configService.get<string>('PAYMENT_GATEWAY_BASE_URL');
    const privateKey = this.configService.get<string>('PAYMENT_GATEWAY_PRIVATE_KEY');

    try {
      const response = await fetch(`${baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${privateKey}`,
        },
        body: JSON.stringify({
          reference: request.reference,
          amount_in_cents: request.amountInCents,
          currency: request.currency,
          customer_email: request.customerEmail,
          card: {
            number: request.card.number,
            cvc: request.card.cvc,
            exp_month: request.card.expMonth,
            exp_year: request.card.expYear,
            card_holder: request.card.cardHolder,
          },
        }),
      });

      if (!response.ok) {
        return Result.fail(
          new DomainError(DomainErrorCode.PAYMENT_GATEWAY_UNAVAILABLE, `Payment gateway responded with ${response.status}`),
        );
      }

      const payload = await response.json();

      return Result.ok({
        providerTransactionId: payload.id,
        status: payload.status === 'APPROVED' ? 'APPROVED' : 'DECLINED',
        cardLast4: request.card.number.slice(-4),
        cardBrand: detectCardBrand(request.card.number),
      });
    } catch (error) {
      this.logger.error(`Payment gateway call failed: ${(error as Error).message}`);
      return Result.fail(
        new DomainError(DomainErrorCode.PAYMENT_GATEWAY_UNAVAILABLE, 'Payment gateway is unreachable'),
      );
    }
  }
}

const VISA_REGEX = /^4\d{12}(\d{3})?$/;
const MASTERCARD_REGEX = /^(5[1-5]\d{14}|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)\d{12})$/;

function detectCardBrand(cardNumber: string): string {
  if (VISA_REGEX.test(cardNumber)) return 'VISA';
  if (MASTERCARD_REGEX.test(cardNumber)) return 'MASTERCARD';
  return 'UNKNOWN';
}
