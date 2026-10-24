import type { OrderStepKey } from '../sim/types';

export type StepState = 'done' | 'current' | 'todo';

/** Steps that last a while: they are done only when the next step has started. */
const DURATIVE: OrderStepKey[] = ['handling', 'in_flight'];

/**
 * Stepper states (spec §4.5). Instant steps (Tiếp lệnh, Kiểm phẩm, Giao nhận) are done when
 * they happen; Bốc/Dỡ and Ngự không stay current until the following step begins.
 */
export function stepStates(steps: { key: OrderStepKey; at?: number }[]): StepState[] {
  const done = steps.map((s, i) => (DURATIVE.includes(s.key) ? steps[i + 1]?.at !== undefined : s.at !== undefined));
  const current = done.findIndex((d) => !d);
  return done.map((d, i) => (d ? 'done' : i === current ? 'current' : 'todo'));
}
