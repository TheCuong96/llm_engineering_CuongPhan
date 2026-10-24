import type { ShipmentStepKey } from '../sim/types';

export type StepState = 'done' | 'current' | 'todo';

/** Steps that last a while: they are done only when the next step has started. */
const DURATIVE: ShipmentStepKey[] = ['handling', 'in_transit'];

/**
 * Stepper states (spec 4.5). Instant steps (Order Confirmed, Picked, Delivered) are done when
 * they happen; Loading/Unloading and In Transit stay current until the following step begins.
 */
export function stepStates(steps: { key: ShipmentStepKey; at?: number }[]): StepState[] {
  const done = steps.map((s, i) => (DURATIVE.includes(s.key) ? steps[i + 1]?.at !== undefined : s.at !== undefined));
  const current = done.findIndex((d) => !d);
  return done.map((d, i) => (d ? 'done' : i === current ? 'current' : 'todo'));
}

export function stepLabel(key: ShipmentStepKey, direction: 'inbound' | 'outbound', handlingDone: boolean): string {
  switch (key) {
    case 'confirmed':
      return 'Order Confirmed';
    case 'picked':
      return 'Picked';
    case 'handling':
      return direction === 'inbound' ? (handlingDone ? 'Unloaded' : 'Unloading') : handlingDone ? 'Loaded' : 'Loading';
    case 'in_transit':
      return 'In Transit';
    case 'delivered':
      return 'Delivered';
  }
}
