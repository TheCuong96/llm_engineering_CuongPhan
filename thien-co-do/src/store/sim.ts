import { create } from 'zustand';
import { defaultConfig } from '../data/peaks';
import { SimClock } from '../sim/clock';
import { createWorld, type World } from '../sim/world';

interface SimState {
  /** Mutable engine world. Components read it through sim selectors, never mutate it. */
  world: World;
  clock: SimClock;
  /** Bumped (throttled) after ticks run, so HUD subscribers know to re-read. */
  version: number;
  /** Bumped when ships appear or disappear, so the scene can re-key its ship list. */
  roster: number;
  viewPeakId: string;
}

export const useSim = create<SimState>(() => ({
  world: createWorld(defaultConfig()),
  clock: new SimClock(),
  version: 0,
  roster: 0,
  viewPeakId: 'PH-01',
}));

export function viewPeak(state: SimState) {
  return state.world.peaks.find((p) => p.id === state.viewPeakId)!;
}

declare global {
  interface Window {
    /** Read-only handle for e2e tests and debugging. */
    __sim?: () => SimState;
  }
}
window.__sim = () => useSim.getState();
