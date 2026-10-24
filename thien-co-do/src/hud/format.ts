// Number and time formatting. Spec examples use "1,412" and "96.6%", so en-US separators.

const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtInt = (n: number) => int.format(Math.round(n));
export const fmt1 = (n: number) => one.format(n);

export function fmtDelta(n: number, digits = 0): string {
  const v = digits === 0 ? Math.round(n) : Number(n.toFixed(digits));
  const body = digits === 0 ? fmtInt(Math.abs(v)) : one.format(Math.abs(v));
  return `${v < 0 ? '−' : '+'}${body}`;
}

export function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const minutesFrom = (seconds: number) => Math.max(0, Math.ceil(seconds / 60));
