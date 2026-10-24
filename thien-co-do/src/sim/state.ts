// World container and the only functions allowed to change entity states.
// Every setter writes to the event log, so the log is a complete history.

import type { SkuDef } from './config';
import { EventLog, type SimEventType } from './events';
import type { Vec3 } from './geometry';
import type { Rng } from './rng';
import type {
  Chest,
  ChestState,
  Guild,
  OrderStepKey,
  Pad,
  PadState,
  Peak,
  Ship,
  ShipState,
  TransportOrder,
  Worker,
  WorkerState,
} from './types';

export interface World {
  tick: number;
  t: number; // simulated seconds since start
  startEpochMs: number;
  rng: Rng;
  log: EventLog;
  peaks: Peak[];
  ships: Map<string, Ship>;
  workers: Map<string, Worker>;
  chests: Map<string, Chest>;
  orders: Map<string, TransportOrder>;
  guilds: Guild[];
  catalog: Map<string, SkuDef>;
  recipients: readonly { name: string; distanceLi: number }[];
  captains: readonly string[];
  peakDistancesLi: Record<string, number>;
  counters: { ship: number; chest: number; order: number; lot: number };
}

export function emit(
  world: World,
  type: SimEventType,
  peakId: string,
  entityId: string,
  payload?: Record<string, unknown>,
): void {
  world.log.push({ t: world.t, type, peakId, entityId, payload });
}

export function peakDistanceLi(world: World, a: string, b: string): number {
  const key = [a, b].sort().join('|');
  const li = world.peakDistancesLi[key];
  if (li === undefined) throw new Error(`no sky route ${key}`);
  return li;
}

/** SKUs a transfer from `from` to `to` may carry: only what the destination keeps a line for. */
export function sharedSkus(from: Peak, to: Peak): string[] {
  const dest = new Set(to.inventory.map((i) => i.sku));
  return from.inventory.map((i) => i.sku).filter((s) => dest.has(s));
}

export function getPeak(world: World, id: string): Peak {
  const peak = world.peaks.find((p) => p.id === id);
  if (!peak) throw new Error(`unknown peak ${id}`);
  return peak;
}

export function setShipState(world: World, ship: Ship, to: ShipState): void {
  const from = ship.state;
  ship.state = to;
  emit(world, 'ship_state', ship.homePeakId, ship.id, { from, to });
}

export function setWorkerState(world: World, worker: Worker, to: WorkerState): void {
  const from = worker.state;
  worker.state = to;
  emit(world, 'worker_state', worker.peakId, worker.id, { from, to });
}

export function setPadState(world: World, peak: Peak, pad: Pad, to: PadState, shipId?: string): void {
  const from = pad.state;
  pad.state = to;
  pad.shipId = shipId;
  emit(world, 'pad_state', peak.id, `${peak.id}/${pad.id}`, { from, to, shipId });
}

export function setChestState(
  world: World,
  chest: Chest,
  to: ChestState,
  location: Chest['location'],
): void {
  const from = chest.state;
  chest.state = to;
  chest.location = location;
  emit(world, 'chest_state', chest.peakId, chest.id, { from, to, at: `${location.kind}:${location.ref}` });
}

export function markOrderStep(world: World, order: TransportOrder, key: OrderStepKey): void {
  const step = order.steps.find((s) => s.key === key);
  if (!step || step.at !== undefined) return;
  step.at = world.t;
  emit(world, 'order_step', order.peakId, order.id, { step: key, shipId: order.shipId });
}

export function createChest(world: World, peakId: string, sku: string, state: ChestState, location: Chest['location']): Chest {
  const def = world.catalog.get(sku);
  if (!def) throw new Error(`unknown sku ${sku}`);
  world.counters.chest += 1;
  world.counters.lot += world.rng.int(0, 1);
  const chest: Chest = {
    id: `R-${world.counters.chest}`,
    peakId,
    sku,
    name: def.name,
    category: def.category,
    grade: def.grade,
    qty: def.qtyPerChest,
    weightKg: def.weightKg,
    lot: `L${world.counters.lot}`,
    receivedAt: world.t,
    state,
    location,
    needsCold: def.cold ? { maxMinutesOutside: def.cold.maxMinutesOutside, minutesOutside: 0, warned: false } : undefined,
  };
  world.chests.set(chest.id, chest);
  return chest;
}

/** Where a chest sitting in the yard or vault physically is. */
export function slotPos(peak: Peak, ref: string): Vec3 {
  if (ref === 'vault') return peak.geometry.vaultDoor;
  const i = Number(ref.replace('yard-', ''));
  const pos = peak.geometry.yardSlots[i];
  if (!pos) throw new Error(`bad slot ${ref}`);
  return pos;
}

/** Take one chest's worth of a SKU out of aggregate inventory; emits low_stock on the crossing. */
export function takeFromInventory(world: World, peak: Peak, sku: string): boolean {
  const item = peak.inventory.find((i) => i.sku === sku);
  if (!item || item.qty <= 0) return false;
  item.qty -= 1;
  if (item.qty === item.lowStockThreshold - 1) emit(world, 'low_stock', peak.id, item.sku, { qty: item.qty });
  return true;
}

export function putIntoInventory(peak: Peak, sku: string): void {
  const item = peak.inventory.find((i) => i.sku === sku);
  if (!item) throw new Error(`${peak.id} has no inventory line for ${sku}`);
  item.qty += 1;
}
