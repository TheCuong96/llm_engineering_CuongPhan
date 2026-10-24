// Simulation constants. Times are simulated seconds, distances metres.

export const CARGO_CAPACITY = 8;
export const SHIP_SAIL_MPS = 6;
export const SHIP_LAND_MPS = 2.5;
export const SHIP_TRANSIT_MPS = 20;
export const GATE_WAIT_S: [number, number] = [120, 360]; // 2–6 sim minutes (spec §7.3)
export const DELIVERED_LINGER_S = 60;
/** Ships allowed per peak beyond its pad count, so queues at the barrier can form. */
export const EXTRA_SHIPS_PER_PEAK = 2;
export const DUE_SLACK = 1.3;
/** Share of outbound orders that go to another peak instead of an outside town. */
export const TRANSFER_SHARE = 0.35;
export const TRANSIT_ALTITUDE = 60;
export const HANDLING_EST_S_PER_CHEST = 60;

export const BARRIER_COST_PER_OPEN = 2;
export const BARRIER_REGEN_PER_MIN = 1;
export const BARRIER_WEAK_BELOW = 60;
export const BARRIER_WEAK_SLOWDOWN = 2;

export const QI_LOW = 20;
export const QI_RESTORED = 95;
export const QI_COST_PER_MOVE = { disciple: 7, puppet: 5 } as const;
export const PUPPET_RESTORE_MULT = 2;

export const COLD_WARN_RATIO = 0.7;
