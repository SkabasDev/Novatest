import { CheckoutSummary, PaymentResult } from './checkoutSlice';
import { downloadReceipt } from './receipt';

const summary: CheckoutSummary = {
  lines: [
    { productId: 'p-1', productName: 'Audífonos', unitPriceInCents: 150_000_00, quantity: 1 },
    { productId: 'p-2', productName: 'Teclado', unitPriceInCents: 90_000_00, quantity: 2 },
  ],
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

  it('lists one row per line plus a subtotal row', () => {
    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const OriginalBlob = global.Blob;
    const blobSpy = jest.spyOn(global, 'Blob').mockImplementation((parts, options) => new OriginalBlob(parts, options));

    downloadReceipt(summary, result);

    const [parts] = blobSpy.mock.calls[0];
    const text = (parts as string[]).join('');

    expect(text).toContain('Audífonos × 1: $ 150.000');
    expect(text).toContain('Teclado × 2: $ 180.000');
    expect(text).toContain('Subtotal: $ 330.000');

    blobSpy.mockRestore();
  });
});
