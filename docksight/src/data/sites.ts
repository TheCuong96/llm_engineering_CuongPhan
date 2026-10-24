// Site presets (spec 7.1). Inventory lines sum to stockOnHand − staged pallets, and each
// site starts with one line under its Low Stock threshold. Street names are fictional.

import type { ForkliftPreset, SitePreset, WorldConfig } from '../sim/config';
import { carriers, catalog, customers, drivers } from './catalog';

const CHARGER = '48 V lithium-ion forklift charger';
const charger = (id: string, ratePctPerMin = 4) => ({ id, label: CHARGER, ratePctPerMin });
const forklift = (id: string, driver: string, battery: number, model = 'Kestrel EF-18'): ForkliftPreset => ({
  id,
  driver,
  model,
  battery,
  speedKmh: 10,
});

// Sites sit ~700 m apart so their roads and tree belts never overlap; only the viewed one is drawn.
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
    chargers: [charger('C1')],
    inventory: [
      { sku: 'BOX-M', qty: 620, lowStockThreshold: 120 },
      { sku: 'CNT-PL', qty: 312, lowStockThreshold: 60 },
      { sku: 'PPE-HLM', qty: 455, lowStockThreshold: 80 },
      { sku: 'TAPE-48', qty: 22, lowStockThreshold: 40 },
    ],
    // Third staged pallet becomes PAL-1026 · Safety Helmet, as in the reference video.
    staged: ['BOX-M', 'CNT-PL', 'PPE-HLM'],
    forklifts: [forklift('FL-01', 'Sam Haddad', 82), forklift('FL-02', 'Priya Nair', 46)],
    arrivalEveryMin: [4, 9],
  },
  {
    id: 'WH-02',
    name: 'Northgate DC',
    kind: 'distribution_center',
    address: '480 Northfield Blvd, Newark NJ',
    capacity: 4200,
    worldPos: [700, 0, -150],
    layout: 'distribution_center',
    kpiBaseline: { stockOnHand: 3310, trucksOnSite: 0, onTimePct30d: 98.2 },
    today: { outbound: 21, putAways: 35 },
    docks: [
      { label: 'In 1', direction: 'in' },
      { label: 'In 2', direction: 'in' },
      { label: 'Out 1', direction: 'out' },
      { label: 'Out 2', direction: 'out' },
    ],
    chargers: [charger('C1'), charger('C2')],
    inventory: [
      { sku: 'LED-6060', qty: 820, lowStockThreshold: 150 },
      { sku: 'PPE-GLV', qty: 1240, lowStockThreshold: 200 },
      { sku: 'BOX-M', qty: 1210, lowStockThreshold: 200 },
      { sku: 'CHR-OFC', qty: 37, lowStockThreshold: 50 },
    ],
    staged: ['LED-6060', 'PPE-GLV', 'BOX-M'],
    forklifts: [
      forklift('FL-05', 'Marcus Lee', 88),
      forklift('FL-06', 'Elena Ruiz', 64),
      forklift('FL-07', 'Tom Okafor', 51),
      forklift('FL-08', 'Hana Kim', 93),
    ],
    arrivalEveryMin: [3, 7],
  },
  {
    id: 'WH-03',
    name: 'Eastport Cold Chain',
    kind: 'cold_store',
    address: '7 Harbor Reach, Elizabeth NJ',
    capacity: 1400,
    worldPos: [1400, 0, 100],
    layout: 'cold_store',
    kpiBaseline: { stockOnHand: 990, trucksOnSite: 0, onTimePct30d: 96.0 },
    today: { outbound: 31, putAways: 20 },
    docks: [
      { label: 'Bay 1', direction: 'in' },
      { label: 'Bay 2', direction: 'out' },
      { label: 'Bay 3', direction: 'in' },
    ],
    chargers: [charger('C1')],
    inventory: [
      { sku: 'FRZ-PEA', qty: 540, lowStockThreshold: 90 },
      { sku: 'WTR-24', qty: 380, lowStockThreshold: 60 },
      { sku: 'PPE-GLV', qty: 50, lowStockThreshold: 60 },
      { sku: 'CNT-PL', qty: 18, lowStockThreshold: 15 },
    ],
    staged: ['FRZ-PEA', 'WTR-24'],
    forklifts: [forklift('FL-09', 'Diego Alvarez', 71), forklift('FL-11', 'Ruth Mendel', 38)],
    arrivalEveryMin: [4, 8],
  },
  {
    id: 'WH-04',
    name: 'Southfield Cross-Dock',
    kind: 'cross_dock',
    address: '2200 Southmoor Ave, Linden NJ',
    capacity: 1600,
    worldPos: [350, 0, 700],
    layout: 'cross_dock',
    kpiBaseline: { stockOnHand: 610, trucksOnSite: 0, onTimePct30d: 96.2 },
    today: { outbound: 29, putAways: 20 },
    docks: [
      { label: 'In 1', direction: 'in' },
      { label: 'In 2', direction: 'in' },
      { label: 'In 3', direction: 'in' },
      { label: 'Out 1', direction: 'out' },
      { label: 'Out 2', direction: 'out' },
      { label: 'Out 3', direction: 'out' },
    ],
    // The video shows a charging yard here (C1, C2, C3).
    chargers: [charger('C1'), charger('C2'), charger('C3')],
    inventory: [
      { sku: 'BOX-M', qty: 260, lowStockThreshold: 60 },
      { sku: 'WTR-24', qty: 210, lowStockThreshold: 50 },
      { sku: 'CHR-OFC', qty: 112, lowStockThreshold: 30 },
      { sku: 'TAPE-48', qty: 25, lowStockThreshold: 40 },
    ],
    staged: ['BOX-M', 'WTR-24', 'CHR-OFC'],
    forklifts: [forklift('FL-10', 'Kofi Mensah', 84), forklift('FL-12', 'Ava Laurent', 22), forklift('FL-13', 'Jonah Pike', 67)],
    arrivalEveryMin: [2, 5],
  },
  {
    id: 'WH-05',
    name: 'Westgate Robotics Hub',
    kind: 'automated_dc',
    address: '300 Westbrook Rd, Kearny NJ',
    capacity: 2400,
    worldPos: [1050, 0, 750],
    layout: 'automated_dc',
    kpiBaseline: { stockOnHand: 1730, trucksOnSite: 0, onTimePct30d: 95.9 },
    today: { outbound: 33, putAways: 25 },
    docks: [
      { label: 'Bay 1', direction: 'in' },
      { label: 'Bay 2', direction: 'in' },
      { label: 'Bay 3', direction: 'out' },
      { label: 'Bay 4', direction: 'out' },
    ],
    chargers: [charger('C1', 6), charger('C2', 6)],
    inventory: [
      { sku: 'LED-6060', qty: 610, lowStockThreshold: 120 },
      { sku: 'CNT-PL', qty: 540, lowStockThreshold: 100 },
      { sku: 'PPE-HLM', qty: 520, lowStockThreshold: 100 },
      { sku: 'PPE-GLV', qty: 58, lowStockThreshold: 80 },
    ],
    staged: ['LED-6060', 'CNT-PL'],
    forklifts: [forklift('FL-15', 'Mei Tan', 76, 'Kestrel AGV-20'), forklift('FL-16', 'Priya Nair', 59, 'Kestrel AGV-20')],
    arrivalEveryMin: [3, 7],
  },
];

/** Road distances between sites in km (spec 7.4 `siteDistancesKm`), keys sorted. */
export const siteDistancesKm: Record<string, number> = {
  'WH-01|WH-02': 6,
  'WH-01|WH-03': 9,
  'WH-01|WH-04': 16,
  'WH-01|WH-05': 7,
  'WH-02|WH-03': 14,
  'WH-02|WH-04': 22,
  'WH-02|WH-05': 9,
  'WH-03|WH-04': 8,
  'WH-03|WH-05': 15,
  'WH-04|WH-05': 21,
};

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
    siteDistancesKm,
  };
}
