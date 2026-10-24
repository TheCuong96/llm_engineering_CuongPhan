import type { ReactNode } from 'react';
import type { ChipTone } from './tokens';

const chipClass: Record<ChipTone, string> = {
  success: 'bg-success-bg text-success-ink',
  warning: 'bg-warning-bg text-warning-ink',
  motion: 'bg-accent-tint text-accent-ink',
  neutral: 'bg-neutral-bg text-neutral-ink',
  danger: 'bg-danger-bg text-danger-ink',
};

/** Status chip (spec §4.6). Long Vietnamese labels truncate with a tooltip, never overflow. */
export function Chip({ tone, children, className = '' }: { tone: ChipTone; children: string; className?: string }) {
  return (
    <span
      data-chip={tone}
      title={children}
      className={`inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-chip font-medium leading-5 ${chipClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export type BarTone = 'accent' | 'success' | 'warning' | 'jade';
const barClass: Record<BarTone, string> = {
  accent: 'bg-accent',
  success: 'bg-success-bar',
  warning: 'bg-warning-bar',
  jade: 'bg-success-bar',
};

export function ProgressBar({ value, tone = 'accent', label }: { value: number; tone?: BarTone; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-bg"
    >
      <div className={`h-full rounded-full transition-[width] duration-300 ${barClass[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-[13px]">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  );
}

export function Tile({ label, value, children }: { label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-tile bg-accent-tint/60 p-3">
      <div className="truncate text-[12px] text-ink-muted">{label}</div>
      <div className="mt-0.5 truncate font-serif text-[18px] font-semibold">{value}</div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
