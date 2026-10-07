import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditCardModal } from './CreditCardModal';

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText('Número de tarjeta', { exact: false }), '4242424242424242');
  await userEvent.type(screen.getByLabelText('Nombre del titular'), 'Jane Doe');
  await userEvent.type(screen.getByLabelText('Vencimiento'), '1229');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 123 #45-67, apto 8');
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogotá');
  await userEvent.type(screen.getByLabelText('Celular'), '3001234567');
}

describe('CreditCardModal', () => {
  it('renders as a labelled dialog and calls onClose from the close button', async () => {
    const onClose = jest.fn();
    render(<CreditCardModal onClose={onClose} onSubmit={jest.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Datos de pago y entrega' });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show an error before the field is touched', () => {
    render(<CreditCardModal onClose={jest.fn()} onSubmit={jest.fn()} />);
    expect(screen.queryByText('Escribe el nombre tal como aparece en la tarjeta.')).not.toBeInTheDocument();
  });

  it('shows the invalid-content error on blur once the field has content', async () => {
    render(<CreditCardModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    const cardHolder = screen.getByLabelText('Nombre del titular');
    await userEvent.type(cardHolder, 'Ana');
    await userEvent.tab();

    expect(await screen.findByText('Incluye nombre y apellido.')).toBeInTheDocument();
  });

  it('does not reveal the required error on blur when the field is left empty', async () => {
    render(<CreditCardModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    const cardHolder = screen.getByLabelText('Nombre del titular');
    await userEvent.click(cardHolder);
    await userEvent.tab();

    expect(screen.queryByText('Escribe el nombre tal como aparece en la tarjeta.')).not.toBeInTheDocument();
  });

  it('detects the VISA brand live as the user types', async () => {
    render(<CreditCardModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Número de tarjeta', { exact: false }), '4');

    expect(await screen.findByText('VISA detectada')).toBeInTheDocument();
  });

  it('blocks submission and shows the error count banner when fields are empty', async () => {
    const onSubmit = jest.fn();
    render(<CreditCardModal onClose={jest.fn()} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    expect(await screen.findByText(/Revisa 7 campos marcados para continuar\./)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the captured values once every field is valid', async () => {
    const onSubmit = jest.fn();
    render(<CreditCardModal onClose={jest.fn()} onSubmit={onSubmit} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Revisar pago' }));

    expect(onSubmit).toHaveBeenCalledWith({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: 'Jane Doe',
      expiry: '12/29',
      cvc: '123',
      address: 'Calle 123 #45-67, apto 8',
      city: 'Bogotá',
      phone: '300 123 4567',
    });
  });
});
