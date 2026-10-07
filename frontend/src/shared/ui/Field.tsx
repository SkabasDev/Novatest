import { AlertCircle, Check } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  valid?: boolean;
  hint?: string;
  /** Plex Mono — for values like card numbers or codes, not used by login/register. */
  mono?: boolean;
  /** Shows a 44px "Mostrar/Ocultar" toggle and starts the field as type="password". */
  revealable?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  trailing?: ReactNode;
}

/** Reusable field (spec "Componente nuevo reutilizable: Field") — label, 48px input, valid check, error/hint, optional password reveal. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, valid, hint, mono, revealable, type = 'text', trailing, id, className = '', ...rest }, ref) => {
    const [revealed, setRevealed] = useState(false);
    const inputId = id ?? rest.name;
    const borderClass = error ? 'border-danger' : valid ? 'border-line-strong' : 'border-line';
    const resolvedType = revealable ? (revealed ? 'text' : 'password') : type;
    const hasTrailing = Boolean(trailing) || revealable;

    return (
      <label htmlFor={inputId} className="flex flex-col gap-1.5 text-[14px] font-medium text-fg-1">
        {label}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={Boolean(error)}
            className={`h-12 w-full rounded-sm border bg-inset px-3.5 text-[16px] font-normal text-fg-1 placeholder:text-fg-4 focus:border-primary focus:outline-none ${
              mono ? 'font-mono tracking-[0.04em]' : ''
            } ${hasTrailing ? 'pr-16' : valid ? 'pr-10' : ''} ${borderClass} ${className}`}
          />
          {revealable ? (
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              className="absolute right-0 top-1/2 flex h-11 min-w-11 -translate-y-1/2 items-center justify-center px-2 text-[13px] font-medium text-primary"
            >
              {revealed ? 'Ocultar' : 'Mostrar'}
            </button>
          ) : (
            <>
              {!trailing && valid && !error && (
                <Check size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" aria-hidden="true" />
              )}
              {trailing && <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">{trailing}</div>}
            </>
          )}
        </div>
        {error ? (
          <span role="alert" className="flex items-center gap-1 text-caption text-danger">
            <AlertCircle size={15} strokeWidth={1.75} aria-hidden="true" />
            {error}
          </span>
        ) : hint ? (
          <span className="text-caption text-fg-3">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Field.displayName = 'Field';
