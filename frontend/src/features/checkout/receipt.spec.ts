import { CheckoutSummary, PaymentResult } from './checkoutSlice';
import { downloadReceipt } from './receipt';

const summary: CheckoutSummary = {
  productName: 'Audífonos',
  unitPriceInCents: 150_000_00,
  quantity: 1,
  baseFeeInCents: 300_000,
  deliveryFeeInCents: 1_200_000,
  delivery: { address: 'Calle 123', city: 'Bogotá', phone: '3001234567' },
  cardLast4: '4242',
  cardBrand: 'VISA',
};

const result: PaymentResult = { status: 'APPROVED', transactionReference: 'SIM-1' };

describe('downloadReceipt', () => {
  it('creates an object URL, clicks a download link and revokes the URL', () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadReceipt(summary, result);

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });
});
