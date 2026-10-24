import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'info' | 'neutral';

const chipTone: Record<Tone, string> = {
  success: 'bg-chip-success-bg text-chip-success-text',
  warning: 'bg-chip-warning-bg text-chip-warning-text',
  info: 'bg-chip-info-bg text-chip-info-text',
  neutral: 'bg-chip-neutral-bg text-chip-neutral-text',
};

/** Status colour lives only on chips and progress bars (spec rule 5); info bars use the accent. */
const barTone: Record<Tone, string> = {
  success: 'bg-success-bar',
  warning: 'bg-warning-bar',
  info: 'bg-accent',
  neutral: 'bg-neutral-bar',
};

/** Frosted-glass card that every HUD region sits in. `embedded` drops the frame (inside the mobile sheet). */
export function Panel({ className = '', children, embedded = false, ...rest }: ComponentPropsWithoutRef<'section'> & { embedded?: boolean }) {
  return (
    <section
      className={`${embedded ? '' : 'rounded-card border border-white/70 bg-white/88 shadow-hud backdrop-blur-[16px]'} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="truncate text-eyebrow font-semibold tracking-[0.08em] text-accent uppercase">{children}</div>;
}

export function Chip({ tone, children, className = '' }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      data-chip={tone}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-chip font-semibold whitespace-nowrap ${chipTone[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Tile({ label, value, children }: { label: string; value?: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-tile bg-tile p-3">
      <div className="text-eyebrow text-ink-muted">{label}</div>
      {value !== undefined && <div className="mt-0.5 text-[17px] font-bold tabular-nums">{value}</div>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'info', label }: { value: number; tone?: Tone; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-bar={tone}
    >
      <div className={`h-full rounded-full transition-[width] duration-300 ${barTone[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** One label/value row of a detail card. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-[13px]">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium tabular-nums">{children}</dd>
    </div>
  );
}

export function IconButton({
  label,
  children,
  onClick,
  disabled,
  pressed,
  className = '',
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-full text-ink-muted hover:bg-tile hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40 disabled:hover:bg-transparent ${className}`}
    >
      {children}
    </button>
  );
}

/** Empty or error state (P7): says what is missing and what to do next, never a blank region. */
export function EmptyState({ title, hint, children, className = '' }: { title: string; hint?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div data-empty className={`flex flex-col items-center justify-center gap-1 px-4 py-4 text-center ${className}`}>
      <p className="text-[13px] font-semibold">{title}</p>
      {hint && <p className="max-w-[34ch] text-[12px] leading-snug text-ink-muted">{hint}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
