export type SimEventType =
  | 'ship_spawned'
  | 'ship_state'
  | 'ship_removed'
  | 'ship_rehomed'
  | 'ship_late'
  | 'worker_state'
  | 'qi_low'
  | 'pad_state'
  | 'chest_state'
  | 'cold_warning'
  | 'barrier_opened'
  | 'barrier_weak'
  | 'barrier_recovered'
  | 'low_stock'
  | 'order_step';

export interface SimEvent {
  t: number;
  type: SimEventType;
  peakId: string;
  entityId: string;
  payload?: Record<string, unknown>;
}

/** Append-only log of every state transition, trimmed to the most recent `cap` events. */
export class EventLog {
  readonly events: SimEvent[] = [];
  /** Total events ever pushed; lets readers detect what is new after trimming. */
  seq = 0;

  constructor(private readonly cap = 20_000) {}

  push(event: SimEvent): void {
    this.events.push(event);
    this.seq++;
    if (this.events.length > this.cap) this.events.splice(0, this.events.length - this.cap);
  }
}
