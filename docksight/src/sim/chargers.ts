import { distance } from './geometry';
import type { Charger, Forklift } from './types';

export interface ChargerChoice {
  charger: Charger;
  /** true = every charger is busy; the forklift joins this charger's queue instead of plugging in. */
  queue: boolean;
}

/**
 * Where a forklift whose battery dropped below 20% goes (spec 7.3: "trạm sạc trống gần nhất",
 * otherwise queued_for_charger). Returns undefined only when the site has no chargers.
 */
export function pickCharger(fl: Forklift, chargers: readonly Charger[]): ChargerChoice | undefined {
  const free = chargers
    .filter((c) => c.forkliftId === undefined)
    .sort((a, b) => distance(fl.pos, a.pos) - distance(fl.pos, b.pos))[0];
  if (free) return { charger: free, queue: false };
  const shortest = [...chargers].sort((a, b) => a.queue.length - b.queue.length)[0];
  return shortest && { charger: shortest, queue: true };
}
