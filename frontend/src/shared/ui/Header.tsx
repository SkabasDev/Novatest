import { Lock, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Stepper } from './Stepper';

export interface HeaderSession {
  fullName: string;
  email: string;
}

interface HeaderProps {
  currentStep?: number;
  /** Stepper only shows on Detail, Login/Register-with-pending and Result (spec §11.2). */
  showStepper?: boolean;
  session?: HeaderSession | null;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

/** Sticky header shown on every screen (spec §4, extended by §11.2 with session). The modal/backdrop repeat their own stepper since they cover it. */
export function Header({ currentStep, showStepper = true, session, onLogoClick, onLoginClick, onLogout }: HeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-[rgba(246,248,252,0.95)] px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-page items-center justify-between">
        <button
          type="button"
          onClick={onLogoClick}
          className="font-display text-[20px] font-bold tracking-[-0.03em] text-fg-1"
        >
          Nova
        </button>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[13px] text-fg-3">
            <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
            Pago seguro
          </span>
          {session ? (
            <SessionMenu session={session} onLogout={onLogout} />
          ) : (
            onLoginClick && (
              <button type="button" onClick={onLoginClick} className="min-h-11 text-[14px] font-semibold text-primary">
                Ingresar
              </button>
            )
          )}
        </div>
      </div>
      {showStepper && currentStep !== undefined && (
        <div className="mx-auto mt-3 max-w-page">
          <Stepper currentStep={currentStep} />
        </div>
      )}
    </header>
  );
}

function SessionMenu({ session, onLogout }: { session: HeaderSession; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(session.fullName);
  const firstName = session.fullName.split(' ')[0];

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={`Cuenta de ${session.fullName}`}
        className="flex items-center gap-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-[13px] font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden text-[14px] font-medium text-fg-1 md:inline">{firstName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-lg bg-panel py-2 shadow-3">
          <div className="px-4 py-2">
            <p className="text-[14px] font-semibold text-fg-1">{session.fullName}</p>
            <p className="truncate text-[13px] text-fg-3">{session.email}</p>
          </div>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] text-fg-1 hover:bg-inset"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return initials.join('');
}
