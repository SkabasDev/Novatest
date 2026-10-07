import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the logo, the secure badge and the current step', () => {
    render(<Header currentStep={3} />);

    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText('Pago seguro')).toBeInTheDocument();
    expect(screen.getByText(/Paso 3 de 4/)).toBeInTheDocument();
  });
});
