// Read-only views over the world. The UI reads the engine only through these.

import { getSite, type World } from './state';

/** Weight of the 30-day baseline when blending in shipments finished this session. */
export const ON_TIME_BASELINE_SHIPMENTS = 300;

export const simDate = (world: World) => new Date(world.startEpochMs + world.t * 1000);

/** Aggregate rack stock plus tracked pallets on site (yard, racking, on a forklift). */
export function stockOnHand(world: World, siteId: string): number {
  const site = getSite(world, siteId);
  let n = site.inventory.reduce((sum, i) => sum + i.qty, 0);
  for (const p of world.pallets.values()) if (p.siteId === siteId && p.location.kind !== 'truck') n++;
  return n;
}

/** Trucks on site = assigned to it and past the access road (spec 7.4). */
export function trucksOnSite(world: World, siteId: string): number {
  let n = 0;
  for (const t of world.trucks.values()) if (t.siteId === siteId && t.state !== 'en_route') n++;
  return n;
}

export function trucksInbound(world: World, siteId: string): number {
  let n = 0;
  for (const t of world.trucks.values()) if (t.siteId === siteId && t.state === 'en_route') n++;
  return n;
}

export function onTimePct(world: World, siteId: string): number {
  const site = getSite(world, siteId);
  const base = ON_TIME_BASELINE_SHIPMENTS;
  const { delivered, onTime } = site.shipmentStats;
  return (((site.kpiBaseline.onTimePct30d / 100) * base + onTime) / (base + delivered)) * 100;
}

export function fillPct(world: World, siteId: string): number {
  return (stockOnHand(world, siteId) / getSite(world, siteId).capacity) * 100;
}

/** Docks with a truck backed in, out of all docks ("1/2 docked"). */
export function dockedCount(world: World, siteId: string): { docked: number; total: number } {
  const docks = getSite(world, siteId).docks;
  return { docked: docks.filter((d) => d.state === 'occupied').length, total: docks.length };
}

export interface Kpi {
  value: number;
  delta: number;
}

export function siteKpis(world: World, siteId: string) {
  const base = getSite(world, siteId).kpiBaseline;
  const stock = stockOnHand(world, siteId);
  const trucks = trucksOnSite(world, siteId);
  const onTime = onTimePct(world, siteId);
  return {
    stockOnHand: { value: stock, delta: stock - base.stockOnHand } satisfies Kpi,
    trucksOnSite: { value: trucks, delta: trucks - base.trucksOnSite, inbound: trucksInbound(world, siteId) },
    onTime: { value: onTime, delta: onTime - base.onTimePct30d } satisfies Kpi,
  };
}
