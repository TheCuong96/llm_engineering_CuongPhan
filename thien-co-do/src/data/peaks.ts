// Five peaks (spec §7.1). Inventory lines sum to chestsOnHand − staged chests.

import type { PeakPreset, WorkerPreset, WorldConfig } from '../sim/config';
import { vi } from '../i18n/vi';
import { catalog, guilds } from './catalog';
import { truongToM } from './units';

const n = vi.names;
const pad = n.pad;
const arrayLabel = n.arrayDescription;

const disciple = (id: string, name: string, layer: number, qi: number): WorkerPreset => ({
  id,
  kind: 'disciple',
  name,
  realm: { stage: 'luyen_khi', layer },
  qi,
  speedKmh: 5,
});

const puppet = (id: string, model: string, qi: number): WorkerPreset => ({
  id,
  kind: 'puppet',
  name: model,
  model,
  qi,
  speedKmh: 4,
});

export const peakPresets: PeakPreset[] = [
  {
    id: 'PH-01',
    name: n.peaks['PH-01'].name,
    kind: 'main',
    locationLabel: n.peaks['PH-01'].location,
    capacity: 1800,
    altitudeM: truongToM(3200),
    worldPos: [0, 0, 0],
    facingDeg: -45, // between PH-02 (east) and PH-04 (south)
    layout: 'main',
    kpiBaseline: { chestsOnHand: 1412, shipsAtPeak: 0, onTimePct30d: 96.6 },
    today: { outChests: 23, inChests: 15 },
    pads: [
      { label: pad(null, 1), direction: 'out' },
      { label: pad(null, 2), direction: 'in' },
    ],
    arrays: [{ id: 'T1', label: arrayLabel, ratePctPerMin: 18 }],
    inventory: [
      { sku: 'spirit_stone_low', qty: 620, lowStockThreshold: 120 },
      { sku: 'blood_lingzhi', qty: 312, lowStockThreshold: 60 },
      { sku: 'foundation_pill', qty: 455, lowStockThreshold: 80 },
      { sku: 'blank_talisman', qty: 22, lowStockThreshold: 40 },
    ],
    staged: ['spirit_stone_low', 'foundation_pill', 'blood_lingzhi'],
    workers: [disciple('DT-07', n.disciples[0], 6, 82), disciple('DT-03', n.disciples[1], 4, 46)],
    arrivalEveryMin: [4, 9],
  },
  {
    id: 'PH-02',
    name: n.peaks['PH-02'].name,
    kind: 'alchemy',
    locationLabel: n.peaks['PH-02'].location,
    capacity: 3000,
    altitudeM: truongToM(2850),
    worldPos: [260, 10, 40],
    layout: 'alchemy',
    kpiBaseline: { chestsOnHand: 2310, shipsAtPeak: 0, onTimePct30d: 97.9 },
    today: { outChests: 31, inChests: 28 },
    pads: [
      { label: pad('in', 1), direction: 'in' },
      { label: pad('in', 2), direction: 'in' },
      { label: pad('out', 1), direction: 'out' },
      { label: pad('out', 2), direction: 'out' },
    ],
    arrays: [
      { id: 'T1', label: arrayLabel, ratePctPerMin: 18 },
      { id: 'T2', label: arrayLabel, ratePctPerMin: 18 },
    ],
    inventory: [
      { sku: 'blood_lingzhi', qty: 880, lowStockThreshold: 150 },
      { sku: 'foundation_pill', qty: 1020, lowStockThreshold: 150 },
      { sku: 'spirit_rice', qty: 390, lowStockThreshold: 80 },
      { sku: 'beast_core_2', qty: 17, lowStockThreshold: 30 },
    ],
    staged: ['foundation_pill', 'blood_lingzhi', 'foundation_pill'],
    workers: [
      disciple('DT-14', n.disciples[2], 5, 74),
      disciple('DT-18', n.disciples[3], 7, 58),
      disciple('DT-21', n.disciples[4], 3, 91),
    ],
    arrivalEveryMin: [3, 7],
  },
  {
    id: 'PH-03',
    name: n.peaks['PH-03'].name,
    kind: 'cold_vault',
    locationLabel: n.peaks['PH-03'].location,
    capacity: 1200,
    altitudeM: truongToM(3480),
    worldPos: [-40, 20, -260],
    layout: 'cold_vault',
    kpiBaseline: { chestsOnHand: 860, shipsAtPeak: 0, onTimePct30d: 95.8 },
    today: { outChests: 18, inChests: 22 },
    pads: [
      { label: pad('in', 1), direction: 'in' },
      { label: pad('in', 2), direction: 'in' },
      { label: pad('out', 1), direction: 'out' },
    ],
    arrays: [{ id: 'T1', label: arrayLabel, ratePctPerMin: 18 }],
    inventory: [
      { sku: 'snow_lotus', qty: 310, lowStockThreshold: 60 },
      { sku: 'cold_iron_ore', qty: 402, lowStockThreshold: 80 },
      { sku: 'blood_lingzhi', qty: 135, lowStockThreshold: 40 },
      { sku: 'spirit_rice', qty: 11, lowStockThreshold: 25 },
    ],
    staged: ['snow_lotus', 'cold_iron_ore'],
    workers: [
      disciple('DT-25', n.disciples[5], 5, 66),
      disciple('DT-27', n.disciples[6], 8, 88),
      disciple('DT-30', n.disciples[7], 4, 52),
    ],
    arrivalEveryMin: [4, 8],
  },
  {
    id: 'PH-04',
    name: n.peaks['PH-04'].name,
    kind: 'transfer',
    locationLabel: n.peaks['PH-04'].location,
    capacity: 1600,
    altitudeM: truongToM(2600),
    worldPos: [60, -10, 260],
    layout: 'transfer',
    kpiBaseline: { chestsOnHand: 540, shipsAtPeak: 0, onTimePct30d: 96.2 },
    today: { outChests: 41, inChests: 39 },
    pads: [
      { label: pad('in', 1), direction: 'in' },
      { label: pad('in', 2), direction: 'in' },
      { label: pad('in', 3), direction: 'in' },
      { label: pad('out', 1), direction: 'out' },
      { label: pad('out', 2), direction: 'out' },
      { label: pad('out', 3), direction: 'out' },
    ],
    arrays: [
      { id: 'T1', label: arrayLabel, ratePctPerMin: 18 },
      { id: 'T2', label: arrayLabel, ratePctPerMin: 18 },
      { id: 'T3', label: arrayLabel, ratePctPerMin: 18 },
    ],
    inventory: [
      { sku: 'spirit_stone_low', qty: 210, lowStockThreshold: 60 },
      { sku: 'cold_iron_ore', qty: 160, lowStockThreshold: 40 },
      { sku: 'blank_talisman', qty: 158, lowStockThreshold: 40 },
      { sku: 'green_steel_blank', qty: 8, lowStockThreshold: 20 },
    ],
    staged: ['spirit_stone_low', 'cold_iron_ore', 'blank_talisman', 'spirit_stone_low'],
    workers: [
      disciple('DT-10', n.disciples[8], 6, 84),
      disciple('DT-12', n.disciples[9], 5, 18),
      disciple('DT-15', n.disciples[10], 3, 63),
      disciple('DT-16', n.disciples[11], 7, 77),
    ],
    arrivalEveryMin: [2, 5],
  },
  {
    id: 'PH-05',
    name: n.peaks['PH-05'].name,
    kind: 'automaton',
    locationLabel: n.peaks['PH-05'].location,
    capacity: 2400,
    altitudeM: truongToM(2950),
    worldPos: [-260, 5, 30],
    layout: 'automaton',
    kpiBaseline: { chestsOnHand: 1730, shipsAtPeak: 0, onTimePct30d: 95.9 },
    today: { outChests: 33, inChests: 25 },
    pads: [
      { label: pad('in', 1), direction: 'in' },
      { label: pad('in', 2), direction: 'in' },
      { label: pad('out', 1), direction: 'out' },
      { label: pad('out', 2), direction: 'out' },
    ],
    arrays: [
      { id: 'T1', label: arrayLabel, ratePctPerMin: 18 },
      { id: 'T2', label: arrayLabel, ratePctPerMin: 18 },
    ],
    inventory: [
      { sku: 'cold_iron_ore', qty: 690, lowStockThreshold: 120 },
      { sku: 'green_steel_blank', qty: 540, lowStockThreshold: 100 },
      { sku: 'spirit_stone_low', qty: 488, lowStockThreshold: 100 },
      { sku: 'beast_core_2', qty: 9, lowStockThreshold: 20 },
    ],
    staged: ['green_steel_blank', 'cold_iron_ore', 'spirit_stone_low'],
    workers: [
      puppet('KL-15', n.puppetModels[0], 71),
      puppet('KL-16', n.puppetModels[0], 44),
      puppet('KL-17', n.puppetModels[1], 93),
      puppet('KL-18', n.puppetModels[2], 58),
    ],
    arrivalEveryMin: [3, 7],
  },
];

/** Sky routes between peaks in dặm (spec §7.4 peakDistancesLi). Keys are sorted id pairs. */
export const peakDistancesLi: Record<string, number> = {
  'PH-01|PH-02': 18,
  'PH-01|PH-03': 22,
  'PH-01|PH-04': 16,
  'PH-01|PH-05': 20,
  'PH-02|PH-03': 30,
  'PH-02|PH-04': 26,
  'PH-02|PH-05': 34,
  'PH-03|PH-04': 36,
  'PH-03|PH-05': 24,
  'PH-04|PH-05': 28,
};

/** Sim start: Giờ Tỵ 09:40 local time (spec §4.1). */
export const SIM_START = new Date(2026, 9, 23, 9, 40).getTime();

export function defaultConfig(seed = 20261023, peakIds?: string[]): WorldConfig {
  return {
    seed,
    startEpochMs: SIM_START,
    peaks: peakIds ? peakPresets.filter((p) => peakIds.includes(p.id)) : peakPresets,
    guilds,
    catalog,
    recipients: n.recipients,
    captains: n.captains,
    peakDistancesLi,
  };
}
