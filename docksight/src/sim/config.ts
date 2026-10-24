import type { Vec3 } from './geometry';
import type { Carrier, SiteKind } from './types';

/** Catalog entry: what one pallet of this SKU holds. */
export interface SkuDef {
  sku: string;
  name: string;
  category: string; // pallet eyebrow, e.g. 'PPE'
  qtyPerPallet: number;
  weightKg: number; // per pallet
  icon: string;
}

export interface ForkliftPreset {
  id: string;
  driver: string;
  model: string;
  battery: number;
  speedKmh: number;
}

export interface SitePreset {
  id: string;
  name: string;
  kind: SiteKind;
  address: string;
  capacity: number;
  worldPos: Vec3;
  layout: string;
  kpiBaseline: { stockOnHand: number; trucksOnSite: number; onTimePct30d: number };
  today: { outbound: number; putAways: number };
  docks: { label: string; direction: 'in' | 'out' }[];
  chargers: { id: string; label: string; ratePctPerMin: number }[];
  inventory: { sku: string; qty: number; lowStockThreshold: number }[];
  /** SKUs of pallets already waiting in the yard at start. */
  staged: string[];
  forklifts: ForkliftPreset[];
  arrivalEveryMin: [number, number];
}

export interface WorldConfig {
  seed: number;
  startEpochMs: number;
  sites: SitePreset[];
  carriers: Carrier[];
  catalog: SkuDef[];
  customers: readonly { name: string; city: string; distanceKm: number }[];
  drivers: readonly string[];
  /** Road distances between sites in km, keyed "WH-01|WH-02" (ids sorted). */
  siteDistancesKm: Record<string, number>;
}
