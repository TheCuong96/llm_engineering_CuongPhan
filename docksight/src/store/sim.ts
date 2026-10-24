import { create } from 'zustand';
import { defaultConfig } from '../data/sites';
import { SimClock } from '../sim/clock';
import { getSite } from '../sim/state';
import { createWorld, type World } from '../sim/world';

interface SimState {
  /** Mutable engine world. Components read it through sim selectors, never mutate it. */
  world: World;
  clock: SimClock;
  /** Bumped (throttled) after ticks run, so HUD subscribers know to re-read. */
  version: number;
  /** Bumped when trucks appear or disappear, so the scene can re-key its truck list. */
  roster: number;
  /** The site being rendered; every site keeps ticking regardless (spec 7.4). */
  viewSiteId: string;
}

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed')) || undefined;

export const useSim = create<SimState>(() => ({
  world: createWorld(defaultConfig(seed)),
  clock: new SimClock(),
  version: 0,
  roster: 0,
  viewSiteId: 'WH-01',
}));

export const viewSite = (s: SimState) => getSite(s.world, s.viewSiteId);

declare global {
  interface Window {
    /** Read-only handle for e2e tests and debugging. */
    __sim?: () => SimState;
  }
}
window.__sim = () => useSim.getState();
