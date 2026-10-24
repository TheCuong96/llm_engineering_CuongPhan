import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'info' | 'neutral';

const chipTone: Record<Tone, string> = {
  success: 'bg-chip-success-bg text-chip-success-text',
  warning: 'bg-chip-warning-bg text-chip-warning-text',
  info: 'bg-chip-info-bg text-chip-info-text',
  neutral: 'bg-chip-neutral-bg text-chip-neutral-text',
};

const barTone: Record<Tone, string> = {
  success: 'bg-success-bar',
  warning: 'bg-warning-bar',
  info: 'bg-accent',
  neutral: 'bg-neutral-bar',
};

/** Frosted-glass card that every HUD region sits in. */
export function Panel({ className = '', children, ...rest }: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={`rounded-card border border-white/70 bg-white/88 shadow-hud backdrop-blur-[16px] ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="text-eyebrow font-semibold tracking-[0.08em] text-accent uppercase">{children}</div>;
}

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-chip font-semibold ${chipTone[tone]}`}>
      {children}
    </span>
  );
}

export function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-tile bg-tile p-3">
      <div className="text-eyebrow text-ink-muted">{label}</div>
      {children}
    </div>
  );
}

export function ProgressBar({ value, tone = 'info' }: { value: number; tone?: Tone }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${barTone[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
