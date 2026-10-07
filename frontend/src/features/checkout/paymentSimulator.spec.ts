import { simulatePayment } from './paymentSimulator';

describe('simulatePayment', () => {
  it('approves when the card number ends in an even digit', async () => {
    const result = await simulatePayment('4242424242424242');
    expect(result.status).toBe('APPROVED');
    expect(result.transactionReference).toMatch(/^SIM-/);
  });

  it('declines when the card number ends in an odd digit', async () => {
    const result = await simulatePayment('4242424242424241');
    expect(result.status).toBe('DECLINED');
  });
});
