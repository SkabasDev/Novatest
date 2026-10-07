import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
}

/** Success toast shown above the product content after returning from checkout (spec §5.5). */
export function Toast({ message }: ToastProps) {
  return (
    <div role="status" className="mx-auto mt-3 flex max-w-page items-center gap-2 rounded bg-success-tint px-4 py-3 text-[14px] text-fg-1 ring-1 ring-success/40">
      <Check size={18} strokeWidth={1.75} className="shrink-0 text-success" aria-hidden="true" />
      {message}
    </div>
  );
}
