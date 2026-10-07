import { AlertCircle, Check } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Shows a trailing check icon (hidden automatically when `trailing` is provided, e.g. card brand logos). */
  valid?: boolean;
  trailing?: ReactNode;
  hint?: string;
}

/** Text input implementing the empty/focus/error/valid states from spec §6. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, valid, trailing, hint, id, className = '', ...rest }, ref) => {
    const inputId = id ?? rest.name;
    const borderClass = error ? 'border-danger' : valid ? 'border-line-strong' : 'border-line';

    return (
      <label htmlFor={inputId} className="flex flex-col gap-1.5 text-[14px] font-medium text-fg-1">
        {label}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            className={`h-12 w-full rounded-sm border bg-inset px-3.5 text-[16px] font-normal text-fg-1 placeholder:text-fg-4 focus:border-primary focus:outline-none ${
              trailing ? 'pr-28' : valid ? 'pr-10' : ''
            } ${borderClass} ${className}`}
          />
          {!trailing && valid && !error && (
            <Check size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" aria-hidden="true" />
          )}
          {trailing && <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">{trailing}</div>}
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

Input.displayName = 'Input';
