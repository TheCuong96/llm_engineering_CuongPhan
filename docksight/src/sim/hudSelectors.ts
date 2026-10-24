// Derived numbers for the HUD (spec 7.4). Pure reads; formatting happens in src/hud.

import { distance } from './geometry';
import { getSite, type World } from './state';
import { transitSeconds } from './trucks';
import type { Forklift, Shipment, Truck } from './types';
import { GATE_CHECKIN_S, HANDLING_EST_S_PER_PALLET, YARD_KMH } from './tuning';

const DOCKING_EST_S = 20;
const AVG_CHECKIN_S = (GATE_CHECKIN_S[0] + GATE_CHECKIN_S[1]) / 2;

const BUSY_FORKLIFT = new Set<Forklift['state']>(['fetching', 'loading_truck', 'unloading_truck', 'returning']);
const AT_DOCK = new Set<Truck['state']>(['docking', 'unloading', 'loading']);
const ARRIVING = new Set<Truck['state']>(['en_route', 'at_gate']);

/** "2 docked · 1 arriving · 3 staged" plus the counters behind the site tiles and tabs. */
export function siteSummary(world: World, siteId: string) {
  const site = getSite(world, siteId);
  let docked = 0;
  let arriving = 0;
  let onSite = 0;
  for (const t of world.trucks.values()) {
    if (t.siteId !== siteId) continue;
    onSite++;
    if (AT_DOCK.has(t.state)) docked++;
    else if (ARRIVING.has(t.state)) arriving++;
  }
  let staged = 0;
  for (const p of world.pallets.values()) if (p.siteId === siteId && p.state === 'staged') staged++;
  const fleet = [...world.forklifts.values()].filter((f) => f.siteId === siteId);
  return {
    docked,
    arriving,
    staged,
    trucksOnMap: onSite,
    busyBays: site.docks.filter((d) => d.state !== 'available').length,
    occupiedBays: site.docks.filter((d) => d.state === 'occupied').length,
    totalBays: site.docks.length,
    forkliftsWorking: fleet.filter((f) => BUSY_FORKLIFT.has(f.state)).length,
    forkliftsTotal: fleet.length,
  };
}

export const isForkliftBusy = (f: Forklift) => BUSY_FORKLIFT.has(f.state);

export type TruckProgress =
  | { kind: 'distance'; remainingM: number; fraction: number }
  | { kind: 'pallets'; done: number; capacity: number }
  | null;

export function truckProgress(truck: Truck): TruckProgress {
  switch (truck.state) {
    case 'en_route':
    case 'docking':
    case 'departing': {
      const m = truck.motion;
      if (!m) return null;
      const total = distance(m.from, m.to);
      const remainingM = distance(truck.pos, m.to);
      return { kind: 'distance', remainingM, fraction: total > 0 ? 1 - remainingM / total : 1 };
    }
    case 'at_gate':
      return { kind: 'distance', remainingM: 0, fraction: 1 };
    case 'loading':
      return { kind: 'pallets', done: truck.cargo.pallets, capacity: truck.cargo.capacity };
    case 'unloading':
      return { kind: 'pallets', done: truck.cargo.pallets, capacity: truck.cargo.capacity };
    default:
      return null;
  }
}

export type StepKey = Shipment['steps'][number]['key'];

/**
 * Shipment steps with real timestamps for what has happened and estimates for the rest,
 * chained from the sim clock: gate check-in → docking → remaining pallets × time per pallet →
 * leaving the yard → (outbound) the drive to the customer.
 */
export function shipmentTimeline(world: World, shipment: Shipment): { key: StepKey; at?: number; eta?: number }[] {
  const truck = world.trucks.get(shipment.truckId);
  const site = getSite(world, shipment.siteId);
  const t = world.t;
  const steps = shipment.steps.map((s) => ({ key: s.key, at: s.at, eta: undefined as number | undefined }));
  if (!truck) return steps;

  const at = (k: StepKey) => steps.find((s) => s.key === k)!;
  let cursor = t;

  // picked = the truck clears the gate
  if (at('picked').at === undefined) {
    if (truck.state === 'en_route' && truck.motion) cursor = truck.motion.start + truck.motion.duration + AVG_CHECKIN_S;
    else cursor = truck.gateClearsAt ?? t + AVG_CHECKIN_S;
    at('picked').eta = cursor;
  } else {
    cursor = Math.max(cursor, at('picked').at!);
  }

  // handling finishes once every pallet has moved
  if (at('in_transit').at === undefined) {
    const dockingLeft = truck.state === 'docking' && truck.motion ? truck.motion.start + truck.motion.duration - t : DOCKING_EST_S;
    const left = Math.max(0, truck.handling.target - truck.handling.done);
    if (at('handling').at === undefined) {
      cursor += Math.max(0, dockingLeft);
      at('handling').eta = cursor;
    }
    cursor = Math.max(cursor, t) + left * HANDLING_EST_S_PER_PALLET;
    at('in_transit').eta = cursor;
  } else {
    cursor = Math.max(t, at('in_transit').at!);
  }

  // delivered: leave the yard, then (outbound) drive to the customer
  if (at('delivered').at === undefined) {
    const exitS =
      truck.state === 'departing' && truck.motion
        ? truck.motion.start + truck.motion.duration - t
        : distance(site.geometry.gate, site.geometry.exitTo) / (YARD_KMH / 3.6);
    if (truck.state === 'in_transit') cursor = truck.eta ?? t;
    else cursor = Math.max(cursor, t) + Math.max(0, exitS) + (shipment.direction === 'outbound' ? transitSeconds(world, shipment) : 0);
    at('delivered').eta = cursor;
  }
  return steps;
}

/** When the shipment completes (delivered step), actual or estimated. */
export function shipmentDoneAt(world: World, shipment: Shipment): number {
  const last = shipmentTimeline(world, shipment).at(-1)!;
  return last.at ?? last.eta ?? world.t;
}

/** Sim seconds until the truck leaves its bay (or, before docking, until it reaches one). */
export function secondsToNextMilestone(world: World, shipment: Shipment): number | null {
  const steps = shipmentTimeline(world, shipment);
  const next = steps.find((s) => s.at === undefined && s.eta !== undefined && (s.key === 'handling' || s.key === 'in_transit'));
  return next?.eta !== undefined ? Math.max(0, next.eta - world.t) : null;
}
