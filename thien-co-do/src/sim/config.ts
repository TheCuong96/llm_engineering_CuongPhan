import type { Vec3 } from './geometry';
import type { Guild, ItemCategory, PeakKind, WorkerKind } from './types';

/** Catalog entry: what one chest of this SKU holds. */
export interface SkuDef {
  sku: string;
  name: string;
  category: ItemCategory;
  grade: number; // phẩm 1–9
  qtyPerChest: number;
  weightKg: number; // per chest
  icon: string;
  cold?: { maxMinutesOutside: number };
}

export interface WorkerPreset {
  id: string;
  kind: WorkerKind;
  name: string;
  realm?: { stage: 'luyen_khi' | 'truc_co'; layer: number };
  model?: string;
  qi: number;
  speedKmh: number;
}

export interface PeakPreset {
  id: string;
  name: string;
  kind: PeakKind;
  locationLabel: string;
  capacity: number;
  altitudeM: number;
  worldPos: Vec3;
  /** Degrees around +Y the pad edge faces; defaults to facing away from the sect centre. */
  facingDeg?: number;
  layout: string;
  kpiBaseline: { chestsOnHand: number; shipsAtPeak: number; onTimePct30d: number };
  today: { outChests: number; inChests: number };
  pads: { label: string; direction: 'in' | 'out' }[];
  arrays: { id: string; label: string; ratePctPerMin: number }[];
  inventory: { sku: string; qty: number; lowStockThreshold: number }[];
  /** SKUs of chests already waiting in the yard at start ("rương chờ"). */
  staged: string[];
  workers: WorkerPreset[];
  arrivalEveryMin: [number, number];
}

export interface WorldConfig {
  seed: number;
  startEpochMs: number;
  peaks: PeakPreset[];
  guilds: Guild[];
  catalog: SkuDef[];
  recipients: readonly { name: string; distanceLi: number }[];
  captains: readonly string[];
  /** Sky-route distances between peaks in dặm, keyed "PH-01|PH-02" (ids sorted). */
  peakDistancesLi: Record<string, number>;
}
