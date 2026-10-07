import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'text' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Only for variant="primary": 56px height for the final payment CTA, 52px otherwise. */
  size?: 'default' | 'large';
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

const BASE = 'inline-flex items-center justify-center gap-2.5 rounded transition-colors duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-40 active:scale-[.98]';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-white font-sans font-semibold text-[16px] hover:bg-primary-hover hover:shadow-glow-primary active:bg-primary-press',
  secondary:
    'bg-transparent border border-line-strong text-fg-1 font-sans font-medium text-[16px] h-11 hover:bg-inset',
  text: 'bg-transparent text-primary font-sans font-medium text-[14px] min-h-11 px-2 hover:bg-primary-tint',
  icon: 'bg-transparent text-fg-3 h-11 w-11 hover:bg-inset hover:text-fg-1',
};

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading,
  loadingText = 'Procesando…',
  icon,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = variant === 'primary' ? (size === 'large' ? 'h-14' : 'h-13') : '';
  const widthClass = variant === 'primary' || variant === 'secondary' ? 'w-full px-4' : '';

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${sizeClass} ${widthClass} ${className}`}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-[18px] w-[18px] animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
