import { Lock } from 'lucide-react';
import { Stepper } from './Stepper';

interface HeaderProps {
  currentStep: number;
}

/** Sticky header shown on every screen (spec §4). The modal/backdrop repeat their own stepper since they cover it. */
export function Header({ currentStep }: HeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-[rgba(246,248,252,0.95)] px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-page items-center justify-between">
        <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-fg-1">Nova</span>
        <span className="flex items-center gap-1.5 text-[13px] text-fg-3">
          <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
          Pago seguro
        </span>
      </div>
      <div className="mx-auto mt-3 max-w-page">
        <Stepper currentStep={currentStep} />
      </div>
    </header>
  );
}
