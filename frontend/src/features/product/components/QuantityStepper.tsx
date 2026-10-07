import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  stock: number;
  onChange: (quantity: number) => void;
}

/** −/+ stepper, range 1..stock, per spec §5.1. */
export function QuantityStepper({ quantity, stock, onChange }: QuantityStepperProps) {
  const atMin = quantity <= 1;
  const atMax = quantity >= stock;

  return (
    <div className="flex h-11 items-center rounded border border-line-strong bg-inset">
      <button
        type="button"
        aria-label="Reducir cantidad"
        disabled={atMin}
        onClick={() => onChange(quantity - 1)}
        className="flex h-11 w-11 items-center justify-center text-fg-1 disabled:opacity-35"
      >
        <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-11 text-center font-sans text-[16px] font-semibold tabular text-fg-1">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={atMax}
        onClick={() => onChange(quantity + 1)}
        className="flex h-11 w-11 items-center justify-center text-fg-1 disabled:opacity-35"
      >
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
