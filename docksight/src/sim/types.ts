// Engine types (spec 7.2) plus the runtime fields the state machines need.
// Pure TS: never import React or three from src/sim.

import type { Motion, Vec3 } from './geometry';

export type SiteKind = 'depot' | 'distribution_center' | 'cold_store' | 'cross_dock' | 'automated_dc';
export type TruckState =
  | 'en_route'
  | 'at_gate'
  | 'docking'
  | 'unloading'
  | 'loading'
  | 'departing'
  | 'in_transit'
  | 'delivered';
export type ForkliftState =
  | 'idle'
  | 'fetching'
  | 'loading_truck'
  | 'unloading_truck'
  | 'returning'
  | 'queued_for_charger'
  | 'charging';
export type PalletState = 'in_rack' | 'staged' | 'moving' | 'loaded';
export type DockState = 'available' | 'reserved' | 'occupied';
export type Direction = 'inbound' | 'outbound';

export interface Dock {
  id: string;
  label: string;
  direction: 'in' | 'out';
  state: DockState;
  truckId?: string;
  /** Where a docked truck's rear sits. */
  pos: Vec3;
  /** Floor point at the door where forklifts pick up and drop off. */
  apron: Vec3;
}

export interface Charger {
  id: string;
  label: string;
  ratePctPerMin: number;
  forkliftId?: string;
  queue: string[];
  sessionsToday: number;
  energyKwhToday: number;
  pos: Vec3;
}

export interface InventoryItem {
  sku: string;
  name: string;
  icon: string;
  qty: number; // pallets
  lowStockThreshold: number;
}

/** World-space anchor points of one site, derived from its preset. */
export interface SiteGeometry {
  center: Vec3;
  gate: Vec3; // truck check-in point at the yard entrance
  approachFrom: Vec3; // map edge where inbound traffic appears
  exitTo: Vec3; // map edge where departing trucks leave the scene
  rackDoor: Vec3; // where forklifts enter the racking
  home: Vec3; // forklifts' idle spot
  yardSlots: Vec3[];
}

export interface Site {
  id: string;
  name: string;
  kind: SiteKind;
  address: string;
  capacity: number; // pallets
  docks: Dock[];
  chargers: Charger[];
  inventory: InventoryItem[];
  worldPos: Vec3;
  layout: string; // scene preset key
  kpiBaseline: { stockOnHand: number; trucksOnSite: number; onTimePct30d: number };
  geometry: SiteGeometry;
  today: { outbound: number; putAways: number };
  shipmentStats: { delivered: number; onTime: number };
  arrivalEveryMin: [number, number];
  outboundShare: number; // 0–1, share of spawned trucks that come to load
  nextArrivalAt: number;
}

export interface Carrier {
  id: string;
  name: string;
  livery: { cab: string; trailer: string; stripe?: string };
}

export interface Truck {
  id: string;
  carrierId: string;
  driver: string;
  plate: string;
  siteId: string | null; // null = on the road between sites, not rendered
  homeSiteId: string; // site this truck was spawned for
  state: TruckState;
  direction: Direction;
  dockId?: string;
  shipmentId: string;
  pos: Vec3;
  route?: Vec3[];
  cargo: { pallets: number; capacity: number; weightKg: number };
  speedKmh: number;
  motion?: Motion;
  /** at_gate: check-in clears at this time (set once a dock is reserved). */
  gateClearsAt?: number;
  /** in_transit: arrival at destination. delivered: removal time. */
  eta?: number;
  handling: { target: number; done: number; assigned: number };
}

export interface ForkliftTask {
  truckId: string;
  dockId: string;
  palletId?: string;
  slotRef?: string; // unloading: yard slot or 'rack'
}

export interface Forklift {
  id: string;
  siteId: string;
  driver: string;
  model: string;
  state: ForkliftState;
  battery: number; // %
  carrying?: string;
  movesToday: number;
  speedKmh: number;
  chargerId?: string;
  task?: ForkliftTask;
  pos: Vec3;
  motion?: Motion;
}

export interface Pallet {
  id: string;
  siteId: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  weightKg: number;
  lot: string;
  receivedAt: number;
  state: PalletState;
  location: { kind: 'slot' | 'forklift' | 'truck'; ref: string };
  reservedBy?: string;
}

export type ShipmentStepKey = 'confirmed' | 'picked' | 'handling' | 'in_transit' | 'delivered';

export interface Shipment {
  id: string;
  siteId: string;
  customer: string;
  destination: string;
  truckId: string;
  direction: Direction;
  steps: { key: ShipmentStepKey; at?: number; eta?: number }[];
  dueAt: number;
  late: boolean;
}

export type Selection = { kind: 'site' | 'truck' | 'forklift' | 'pallet' | 'charger'; id: string } | null;
