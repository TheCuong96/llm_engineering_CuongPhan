// Engine types (spec §7.2) plus the runtime fields the state machines need.
// Pure TS: never import React or three from src/sim.

import type { Motion, Vec3 } from './geometry';

export type PeakKind = 'main' | 'alchemy' | 'cold_vault' | 'transfer' | 'automaton';
export type ShipState =
  | 'sailing'
  | 'at_barrier'
  | 'landing'
  | 'unloading'
  | 'loading'
  | 'departing'
  | 'in_transit'
  | 'delivered';
export type WorkerKind = 'disciple' | 'puppet';
export type WorkerState =
  | 'idle'
  | 'fetching'
  | 'loading_ship'
  | 'unloading_ship'
  | 'returning'
  | 'queued_for_array'
  | 'restoring';
export type ChestState = 'in_vault' | 'staged' | 'carried' | 'loaded';
export type PadState = 'free' | 'reserved' | 'occupied';
export type Direction = 'inbound' | 'outbound';
export type ItemCategory = 'herb' | 'ore' | 'pill' | 'talisman';

export interface Pad {
  id: string;
  label: string;
  direction: 'in' | 'out';
  state: PadState;
  shipId?: string;
  pos: Vec3;
}

export interface GatheringArray {
  id: string;
  label: string;
  ratePctPerMin: number;
  occupantId?: string;
  queue: string[];
  sessionsToday: number;
  qiToday: number;
  pos: Vec3;
}

export interface InventoryItem {
  sku: string;
  name: string;
  icon: string;
  qty: number; // chests
  lowStockThreshold: number;
}

/** World-space anchor points of one peak, derived from its preset. */
export interface PeakGeometry {
  center: Vec3;
  gate: Vec3; // where ships touch the barrier dome
  approachFrom: Vec3; // where inbound traffic appears
  exitTo: Vec3; // where departing ships leave the scene
  vaultDoor: Vec3;
  home: Vec3; // workers' idle spot
  yardSlots: Vec3[];
}

export interface Peak {
  id: string;
  name: string;
  kind: PeakKind;
  locationLabel: string;
  capacity: number;
  altitudeM: number;
  pads: Pad[];
  arrays: GatheringArray[];
  inventory: InventoryItem[];
  barrier: { strength: number; weak: boolean };
  worldPos: Vec3;
  /** Rotation about +Y of the peak-local frame (local +X = pad edge). */
  facingRad: number;
  layout: string;
  kpiBaseline: { chestsOnHand: number; shipsAtPeak: number; onTimePct30d: number };
  geometry: PeakGeometry;
  today: { outChests: number; inChests: number };
  orderStats: { delivered: number; onTime: number };
  arrivalEveryMin: [number, number];
  outboundShare: number; // 0–1, share of spawned ships that come to load
  nextArrivalAt: number;
}

export interface Guild {
  id: string;
  name: string;
  livery: { hull: string; sail: string; flag: string };
}

export interface Ship {
  id: string;
  guildId: string;
  captain: string;
  sealNo: string;
  peakId: string | null; // null = between peaks / outside the sect, not rendered in detail
  homePeakId: string; // peak this ship was spawned for
  state: ShipState;
  direction: Direction;
  padId?: string;
  orderId: string;
  /** Set on outbound transfers to another peak; the ship becomes that peak's inbound ship on arrival. */
  destPeakId?: string;
  pos: Vec3;
  route?: Vec3[];
  cargo: { chests: number; capacity: number; weightKg: number };
  speedMps: number;
  motion?: Motion;
  /** at_barrier: gate opens at this time (set once a pad is reserved). */
  gateOpensAt?: number;
  /** in_transit: arrival time at destination. delivered: removal time. */
  eta?: number;
  handling: { target: number; done: number; assigned: number };
}

export interface WorkerTask {
  shipId: string;
  padId: string;
  chestId?: string;
  slotRef?: string; // unloading: yard slot or 'vault'
}

export interface Worker {
  id: string;
  peakId: string;
  kind: WorkerKind;
  name: string;
  realm?: { stage: 'luyen_khi' | 'truc_co'; layer: number };
  model?: string;
  state: WorkerState;
  qi: number;
  carrying?: string;
  movesToday: number;
  speedKmh: number;
  arrayId?: string;
  task?: WorkerTask;
  pos: Vec3;
  motion?: Motion;
}

export interface Chest {
  id: string;
  peakId: string;
  sku: string;
  name: string;
  category: ItemCategory;
  grade: number;
  qty: number;
  weightKg: number;
  lot: string;
  receivedAt: number;
  state: ChestState;
  needsCold?: { maxMinutesOutside: number; minutesOutside: number; warned: boolean };
  location: { kind: 'slot' | 'worker' | 'ship'; ref: string };
  reservedBy?: string;
}

export type OrderStepKey = 'accepted' | 'inspected' | 'handling' | 'in_flight' | 'delivered';

export interface TransportOrder {
  id: string;
  peakId: string;
  recipient: string;
  destination: string;
  shipId: string;
  direction: Direction;
  destPeakId?: string;
  steps: { key: OrderStepKey; at?: number; eta?: number }[];
  dueAt: number;
  late: boolean;
}

export type Selection = { kind: 'peak' | 'ship' | 'worker' | 'chest' | 'array'; id: string } | null;
