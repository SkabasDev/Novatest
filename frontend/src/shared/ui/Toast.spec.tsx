import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders the message with the status role', () => {
    render(<Toast message="Stock actualizado: quedan 4 unidades." />);
    expect(screen.getByRole('status')).toHaveTextContent('Stock actualizado: quedan 4 unidades.');
  });
});
