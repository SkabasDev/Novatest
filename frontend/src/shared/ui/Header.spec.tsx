import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

describe('Header', () => {
  it('renders the logo, the secure badge and the current step', () => {
    render(<Header currentStep={3} />);

    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText('Pago seguro')).toBeInTheDocument();
    expect(screen.getByText(/Paso 3 de 4/)).toBeInTheDocument();
  });

  it('hides the stepper when showStepper is false', () => {
    render(<Header currentStep={1} showStepper={false} />);
    expect(screen.queryByText(/Paso/)).not.toBeInTheDocument();
  });

  it('shows the "Ingresar" button when there is no session', async () => {
    const onLoginClick = jest.fn();
    render(<Header onLoginClick={onLoginClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  it('shows the session avatar, opens the menu and logs out', async () => {
    const onLogout = jest.fn();
    render(<Header session={{ fullName: 'Jane Doe', email: 'jane@example.com' }} onLogout={onLogout} />);

    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cuenta de Jane Doe' }));

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('closes the menu on an outside click', async () => {
    render(<Header session={{ fullName: 'Jane Doe', email: 'jane@example.com' }} onLogout={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cuenta de Jane Doe' }));
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
  });

  it('calls onLogoClick when the logo is clicked', async () => {
    const onLogoClick = jest.fn();
    render(<Header onLogoClick={onLogoClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova' }));
    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });
});
