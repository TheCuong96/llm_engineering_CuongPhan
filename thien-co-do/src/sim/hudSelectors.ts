// Derived numbers for the HUD (spec §7.4). Pure reads; formatting happens in src/hud.

import { distance } from './geometry';
import { getPeak, type World } from './state';
import type { Ship, TransportOrder, Worker } from './types';
import { transitSeconds } from './ships';
import { GATE_WAIT_S, HANDLING_EST_S_PER_CHEST, SHIP_SAIL_MPS, SHIP_TRANSIT_MPS } from './tuning';

const LANDING_EST_S = 15;
const AVG_GATE_WAIT_S = (GATE_WAIT_S[0] + GATE_WAIT_S[1]) / 2;

const BUSY_WORKER = new Set(['fetching', 'loading_ship', 'unloading_ship', 'returning']);
const LANDED = new Set(['landing', 'unloading', 'loading']);

export function peakSummary(world: World, peakId: string) {
  const peak = getPeak(world, peakId);
  let landed = 0;
  let incoming = 0;
  for (const s of world.ships.values()) {
    if (s.peakId !== peakId) continue;
    if (LANDED.has(s.state)) landed++;
    else if (s.state === 'sailing' || s.state === 'at_barrier') incoming++;
  }
  let waiting = 0;
  for (const c of world.chests.values()) if (c.peakId === peakId && c.state === 'staged') waiting++;
  const workers = [...world.workers.values()].filter((w) => w.peakId === peakId);
  return {
    landed,
    incoming,
    waiting,
    busyPads: peak.pads.filter((p) => p.state !== 'free').length,
    totalPads: peak.pads.length,
    workersBusy: workers.filter((w) => BUSY_WORKER.has(w.state)).length,
    workersTotal: workers.length,
  };
}

export function isWorkerBusy(w: Worker): boolean {
  return BUSY_WORKER.has(w.state);
}

/** Progress of the current leg (0–1) for a worker that is walking; null when standing still. */
export function legProgress(world: World, w: { motion?: { start: number; duration: number } }): number | null {
  if (!w.motion) return null;
  return Math.min(1, Math.max(0, (world.t - w.motion.start) / w.motion.duration));
}

export type ShipProgress =
  | { kind: 'distance'; remainingM: number; fraction: number }
  | { kind: 'chests'; done: number; target: number }
  | null;

export function shipProgress(world: World, ship: Ship): ShipProgress {
  switch (ship.state) {
    case 'sailing':
    case 'landing':
    case 'departing': {
      const m = ship.motion;
      if (!m) return null;
      const total = distance(m.from, m.to);
      const remainingM = distance(ship.pos, m.to);
      return { kind: 'distance', remainingM, fraction: total > 0 ? 1 - remainingM / total : 1 };
    }
    case 'at_barrier':
      return { kind: 'distance', remainingM: 0, fraction: 1 };
    case 'loading':
      return { kind: 'chests', done: ship.cargo.chests, target: ship.handling.target };
    case 'unloading':
      return { kind: 'chests', done: ship.handling.done, target: ship.handling.target };
    case 'in_transit': {
      const remainingS = Math.max(0, (ship.eta ?? world.t) - world.t);
      return { kind: 'distance', remainingM: remainingS * SHIP_TRANSIT_MPS, fraction: 0 };
    }
    default:
      return null;
  }
}


/**
 * Order steps with real timestamps for what has happened and estimates for the rest,
 * chained from the sim clock: gate wait → landing → remaining chests × time per chest →
 * leaving the barrier → (outbound) the flight to the recipient.
 */
export function orderTimeline(world: World, order: TransportOrder): { key: TransportOrder['steps'][number]['key']; at?: number; eta?: number }[] {
  const ship = world.ships.get(order.shipId);
  const peak = getPeak(world, order.peakId);
  const t = world.t;
  const steps = order.steps.map((s) => ({ key: s.key, at: s.at, eta: undefined as number | undefined }));
  if (!ship) return steps;

  const at = (k: string) => steps.find((s) => s.key === k)!;
  let cursor = t;

  // inspected = the gate opens
  if (at('inspected').at === undefined) {
    if (ship.state === 'sailing' && ship.motion) cursor = ship.motion.start + ship.motion.duration + AVG_GATE_WAIT_S;
    else cursor = ship.gateOpensAt ?? t + AVG_GATE_WAIT_S;
    at('inspected').eta = cursor;
  } else {
    cursor = Math.max(cursor, at('inspected').at!);
  }

  // handling finishes once every chest has moved
  if (at('in_flight').at === undefined) {
    const landingLeft = ship.state === 'landing' && ship.motion ? ship.motion.start + ship.motion.duration - t : LANDING_EST_S;
    const left = Math.max(0, ship.handling.target - ship.handling.done);
    const started = at('handling').at !== undefined;
    if (!started) {
      cursor += Math.max(0, landingLeft);
      at('handling').eta = cursor;
    }
    cursor = Math.max(cursor, t) + left * HANDLING_EST_S_PER_CHEST;
    at('in_flight').eta = cursor;
  } else {
    cursor = Math.max(t, at('in_flight').at!);
  }

  // delivered: clear the barrier, then (outbound) fly to the recipient
  if (at('delivered').at === undefined) {
    const exitS = ship.state === 'departing' && ship.motion
      ? ship.motion.start + ship.motion.duration - t
      : distance(peak.geometry.gate, peak.geometry.exitTo) / SHIP_SAIL_MPS;
    if (ship.state === 'in_transit') cursor = ship.eta ?? t;
    else cursor = Math.max(cursor, t) + Math.max(0, exitS) + (order.direction === 'outbound' ? transitSeconds(world, order) : 0);
    at('delivered').eta = cursor;
  }
  return steps;
}

/** When the order completes (delivered step), actual or estimated. */
export function orderDoneAt(world: World, order: TransportOrder): number {
  const last = orderTimeline(world, order).at(-1)!;
  return last.at ?? last.eta ?? world.t;
}
