// World container and the only functions allowed to change entity states.
// Every setter writes to the event log, so the log is a complete history.

import type { SkuDef } from './config';
import { EventLog, type SimEventType } from './events';
import type { Vec3 } from './geometry';
import type { Rng } from './rng';
import type {
  Carrier,
  Dock,
  DockState,
  Forklift,
  ForkliftState,
  Pallet,
  PalletState,
  Shipment,
  ShipmentStepKey,
  Site,
  Truck,
  TruckState,
} from './types';

export interface World {
  tick: number;
  t: number; // simulated seconds since start
  startEpochMs: number;
  rng: Rng;
  log: EventLog;
  sites: Site[];
  trucks: Map<string, Truck>;
  forklifts: Map<string, Forklift>;
  pallets: Map<string, Pallet>;
  shipments: Map<string, Shipment>;
  carriers: Carrier[];
  catalog: Map<string, SkuDef>;
  customers: readonly { name: string; city: string; distanceKm: number }[];
  drivers: readonly string[];
  siteDistancesKm: Record<string, number>;
  counters: { truck: number; pallet: number; shipment: number; lot: number };
}

export function emit(
  world: World,
  type: SimEventType,
  siteId: string,
  entityId: string,
  payload?: Record<string, unknown>,
): void {
  world.log.push({ t: world.t, type, siteId, entityId, payload });
}

export function siteDistanceKm(world: World, a: string, b: string): number {
  const key = [a, b].sort().join('|');
  const km = world.siteDistancesKm[key];
  if (km === undefined) throw new Error(`no road distance ${key}`);
  return km;
}

/** SKUs a transfer from `from` to `to` may carry: only what the destination keeps a line for. */
export function sharedSkus(from: Site, to: Site): string[] {
  const dest = new Set(to.inventory.map((i) => i.sku));
  return from.inventory.map((i) => i.sku).filter((s) => dest.has(s));
}

export function getSite(world: World, id: string): Site {
  const site = world.sites.find((s) => s.id === id);
  if (!site) throw new Error(`unknown site ${id}`);
  return site;
}

export function setTruckState(world: World, truck: Truck, to: TruckState): void {
  const from = truck.state;
  truck.state = to;
  emit(world, 'truck_state', truck.homeSiteId, truck.id, { from, to });
}

export function setForkliftState(world: World, fl: Forklift, to: ForkliftState): void {
  const from = fl.state;
  fl.state = to;
  emit(world, 'forklift_state', fl.siteId, fl.id, { from, to });
}

export function setDockState(world: World, site: Site, dock: Dock, to: DockState, truckId?: string): void {
  const from = dock.state;
  dock.state = to;
  dock.truckId = truckId;
  emit(world, 'dock_state', site.id, `${site.id}/${dock.id}`, { from, to, truckId });
}

export function setPalletState(world: World, pallet: Pallet, to: PalletState, location: Pallet['location']): void {
  const from = pallet.state;
  pallet.state = to;
  pallet.location = location;
  emit(world, 'pallet_state', pallet.siteId, pallet.id, { from, to, at: `${location.kind}:${location.ref}` });
}

export function markShipmentStep(world: World, shipment: Shipment, key: ShipmentStepKey): void {
  const step = shipment.steps.find((s) => s.key === key);
  if (!step || step.at !== undefined) return;
  step.at = world.t;
  emit(world, 'shipment_step', shipment.siteId, shipment.id, { step: key, truckId: shipment.truckId });
}

export function createPallet(world: World, siteId: string, sku: string, state: PalletState, location: Pallet['location']): Pallet {
  const def = world.catalog.get(sku);
  if (!def) throw new Error(`unknown sku ${sku}`);
  world.counters.pallet += 1;
  world.counters.lot += world.rng.int(0, 1);
  const pallet: Pallet = {
    id: `PAL-${world.counters.pallet}`,
    siteId,
    sku,
    name: def.name,
    category: def.category,
    qty: def.qtyPerPallet,
    weightKg: def.weightKg,
    lot: `LOT-${world.counters.lot}`,
    receivedAt: world.t,
    state,
    location,
  };
  world.pallets.set(pallet.id, pallet);
  return pallet;
}

/** Where a pallet sitting in the yard or the racking physically is. */
export function slotPos(site: Site, ref: string): Vec3 {
  if (ref === 'rack') return site.geometry.rackDoor;
  const i = Number(ref.replace('yard-', ''));
  const pos = site.geometry.yardSlots[i];
  if (!pos) throw new Error(`bad slot ${ref}`);
  return pos;
}

/** Take one pallet of a SKU out of aggregate stock; emits low_stock on the crossing. */
export function takeFromInventory(world: World, site: Site, sku: string): boolean {
  const item = site.inventory.find((i) => i.sku === sku);
  if (!item || item.qty <= 0) return false;
  item.qty -= 1;
  if (item.qty === item.lowStockThreshold - 1) emit(world, 'low_stock', site.id, item.sku, { qty: item.qty });
  return true;
}

export function putIntoInventory(site: Site, sku: string): void {
  const item = site.inventory.find((i) => i.sku === sku);
  if (!item) throw new Error(`${site.id} has no inventory line for ${sku}`);
  item.qty += 1;
}
