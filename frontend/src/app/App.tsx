import { Header } from '../shared/ui/Header';

/** Placeholder body for the app-shell PR — CheckoutWizard (routing between the 5 screens) lands next. */
export function App() {
  return (
    <div className="min-h-screen bg-base">
      <Header currentStep={1} />
      <main className="mx-auto max-w-page px-4 py-6">
        <p className="text-fg-3">Cargando producto…</p>
      </main>
    </div>
  );
}
