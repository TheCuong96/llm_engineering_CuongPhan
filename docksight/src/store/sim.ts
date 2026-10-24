import { create } from 'zustand';
import { defaultConfig } from '../data/sites';
import { getSite } from '../sim/state';
import { createWorld, type World } from '../sim/world';

interface SimState {
  world: World;
  /** The site being rendered; every site keeps ticking regardless (spec 7.4). */
  viewSiteId: string;
}

const seed = Number(new URLSearchParams(location.search).get('seed')) || undefined;

export const useSim = create<SimState>(() => ({
  world: createWorld(defaultConfig(seed)),
  viewSiteId: 'WH-01',
}));

export const viewSite = (s: SimState) => getSite(s.world, s.viewSiteId);
