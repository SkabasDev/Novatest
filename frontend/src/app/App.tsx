import { useSessionBootstrap } from '../features/auth/useSessionBootstrap';
import { CheckoutWizard } from './CheckoutWizard';

export function App() {
  useSessionBootstrap();
  return <CheckoutWizard />;
}
