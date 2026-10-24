import type { Selection, Ship } from '../sim/types';
import type { World } from '../sim/world';


const PRIORITY: Ship['state'][] = ['loading', 'unloading', 'landing', 'at_barrier', 'sailing', 'departing'];

/**
 * The ship whose order the bottom bar tracks: the selected ship (even after it leaves),
 * otherwise the busiest ship at the viewed peak.
 */
export function focusShip(world: World, selected: Selection, viewPeakId: string): Ship | undefined {
  if (selected?.kind === 'ship') {
    const s = world.ships.get(selected.id);
    if (s) return s;
  }
  const here = [...world.ships.values()].filter((s) => s.homePeakId === viewPeakId && s.peakId !== null);
  for (const state of PRIORITY) {
    const s = here.find((x) => x.state === state);
    if (s) return s;
  }
  return undefined;
}
