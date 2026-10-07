export interface PaymentSimulationResult {
  status: 'APPROVED' | 'DECLINED';
  transactionReference: string;
}

/**
 * TEMPORARY client-side stand-in for the real payment gateway call. The actual integration
 * (POST /transactions → pay gateway → POST /transactions/:id/pay against the NestJS backend) is
 * deliberately left out of this design-system PR chain and belongs in a dedicated integration PR,
 * since the backend's customer DTO needs fields (email, full name) this design's modal doesn't
 * collect — that mismatch needs its own decision, not a silent workaround here.
 *
 * Deterministic so the declined/error paths stay testable: an even last digit approves.
 */
export async function simulatePayment(cardNumber: string): Promise<PaymentSimulationResult> {
  await delay(1200);

  const digits = cardNumber.replace(/\D/g, '');
  const lastDigit = Number(digits[digits.length - 1] ?? '0');
  const status: PaymentSimulationResult['status'] = lastDigit % 2 === 0 ? 'APPROVED' : 'DECLINED';

  return { status, transactionReference: `SIM-${Date.now()}` };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
