// Read-only views over the world. The UI reads the engine only through these.

import { getPeak, type World } from './state';

/** Weight of the 30-day baseline when blending in orders finished this session. */
export const ON_TIME_BASELINE_ORDERS = 300;

export const simDate = (world: World) => new Date(world.startEpochMs + world.t * 1000);

/** Aggregate stock plus tracked chests that are on the peak (yard, vault, on a worker). */
export function chestsOnHand(world: World, peakId: string): number {
  const peak = getPeak(world, peakId);
  let n = peak.inventory.reduce((sum, i) => sum + i.qty, 0);
  for (const c of world.chests.values()) if (c.peakId === peakId && c.location.kind !== 'ship') n++;
  return n;
}

/** Ships at the peak = assigned to it and past the sailing leg (spec §7.4). */
export function shipsAtPeak(world: World, peakId: string): number {
  let n = 0;
  for (const s of world.ships.values()) if (s.peakId === peakId && s.state !== 'sailing') n++;
  return n;
}

export function shipsIncoming(world: World, peakId: string): number {
  let n = 0;
  for (const s of world.ships.values()) if (s.peakId === peakId && s.state === 'sailing') n++;
  return n;
}

export function onTimePct(world: World, peakId: string): number {
  const peak = getPeak(world, peakId);
  const base = ON_TIME_BASELINE_ORDERS;
  const { delivered, onTime } = peak.orderStats;
  return ((peak.kpiBaseline.onTimePct30d / 100) * base + onTime) / (base + delivered) * 100;
}

export function fillPct(world: World, peakId: string): number {
  return (chestsOnHand(world, peakId) / getPeak(world, peakId).capacity) * 100;
}

export function busyPads(world: World, peakId: string): { busy: number; total: number } {
  const pads = getPeak(world, peakId).pads;
  return { busy: pads.filter((p) => p.state !== 'free').length, total: pads.length };
}

export interface Kpi {
  value: number;
  delta: number;
}

export function peakKpis(world: World, peakId: string) {
  const base = getPeak(world, peakId).kpiBaseline;
  const chests = chestsOnHand(world, peakId);
  const ships = shipsAtPeak(world, peakId);
  const onTime = onTimePct(world, peakId);
  return {
    chestsOnHand: { value: chests, delta: chests - base.chestsOnHand } satisfies Kpi,
    shipsAtPeak: { value: ships, delta: ships - base.shipsAtPeak, incoming: shipsIncoming(world, peakId) },
    onTime: { value: onTime, delta: onTime - base.onTimePct30d } satisfies Kpi,
  };
}
