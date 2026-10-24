// Site presets (spec 7.1). Inventory lines sum to stockOnHand − staged pallets.
// Street names are fictional; the other four sites arrive in P6.

import type { SitePreset, WorldConfig } from '../sim/config';
import { carriers, catalog, customers, drivers } from './catalog';

export const sitePresets: SitePreset[] = [
  {
    id: 'WH-01',
    name: 'Riverside Hub',
    kind: 'depot',
    address: '12 Riverbend Dr, Newark NJ',
    capacity: 1800,
    worldPos: [0, 0, 0],
    layout: 'depot',
    kpiBaseline: { stockOnHand: 1412, trucksOnSite: 0, onTimePct30d: 96.6 },
    today: { outbound: 23, putAways: 15 },
    docks: [
      { label: 'Bay 1', direction: 'out' },
      { label: 'Bay 2', direction: 'in' },
    ],
    chargers: [{ id: 'C1', label: '48 V lithium-ion forklift charger', ratePctPerMin: 4 }],
    inventory: [
      { sku: 'BOX-M', qty: 620, lowStockThreshold: 120 },
      { sku: 'CNT-PL', qty: 312, lowStockThreshold: 60 },
      { sku: 'PPE-HLM', qty: 455, lowStockThreshold: 80 },
      { sku: 'TAPE-48', qty: 22, lowStockThreshold: 40 },
    ],
    // Third staged pallet becomes PAL-1026 · Safety Helmet, as in the reference video.
    staged: ['BOX-M', 'CNT-PL', 'PPE-HLM'],
    forklifts: [
      { id: 'FL-01', driver: 'Sam Haddad', model: 'Kestrel EF-18', battery: 82, speedKmh: 10 },
      { id: 'FL-02', driver: 'Priya Nair', model: 'Kestrel EF-18', battery: 46, speedKmh: 10 },
    ],
    arrivalEveryMin: [4, 9],
  },
];

/** 09:40 local on the demo day, as the reference video's Live clock starts. */
export const START_EPOCH_MS = new Date(2026, 9, 13, 9, 40, 0).getTime();

export function defaultConfig(seed = 20261013, siteIds?: string[]): WorldConfig {
  return {
    seed,
    startEpochMs: START_EPOCH_MS,
    sites: siteIds ? sitePresets.filter((s) => siteIds.includes(s.id)) : sitePresets,
    carriers,
    catalog,
    customers,
    drivers,
  };
}
