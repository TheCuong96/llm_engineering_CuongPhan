export type SimEventType =
  | 'truck_spawned'
  | 'truck_state'
  | 'truck_removed'
  | 'truck_rehomed'
  | 'truck_late'
  | 'forklift_state'
  | 'battery_low'
  | 'dock_state'
  | 'pallet_state'
  | 'low_stock'
  | 'shipment_step';

export interface SimEvent {
  t: number;
  type: SimEventType;
  siteId: string;
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
