// Test helpers (not shipped to the UI).

import { defaultConfig } from '../data/sites';
import type { SimEventType } from './events';
import { createWorld, step, type World } from './world';

/** A world whose automatic arrivals are switched off, so tests drive every truck. */
export function quietWorld(siteIds = ['WH-01'], seed = 1): World {
  const world = createWorld(defaultConfig(seed, siteIds));
  for (const s of world.sites) s.nextArrivalAt = Infinity;
  return world;
}

export function transitions(world: World, type: SimEventType, entityId: string): unknown[] {
  return world.log.events.filter((e) => e.type === type && e.entityId === entityId).map((e) => e.payload?.to);
}

export function runUntil(world: World, done: () => boolean, maxSimSeconds = 3 * 3600): void {
  const limit = world.t + maxSimSeconds;
  while (!done()) {
    if (world.t > limit) throw new Error(`condition not reached within ${maxSimSeconds}s (t=${world.t})`);
    step(world);
  }
}
