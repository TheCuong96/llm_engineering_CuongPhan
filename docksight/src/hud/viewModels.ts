// Selection → formatted card data for the detail panel (spec 4.4). Pure: no React.
// Every string, chip and bar the panel shows is decided here, so tests can check them.

import type { Tone } from '../design/primitives';
import { isForkliftBusy, shipmentDoneAt, siteSummary, truckProgress } from '../sim/hudSelectors';
import { simDate, stockOnHand } from '../sim/selectors';
import type { Charger, Forklift, Pallet, Site, SiteKind, Truck } from '../sim/types';
import type { World } from '../sim/world';
import { chargerSelId, type Sel } from '../store/selection';
import { fmt1, fmtInt, hhmm } from './format';

export interface ChipVM {
  tone: Tone;
  text: string;
}

export interface CardVM {
  sel: Sel;
  siteId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  chip: ChipVM;
  desc?: string;
  progress?: { value: number; caption: string; tone: Tone; label: string };
  fields: { label: string; value: string }[];
  site?: SiteExtras;
  /** Set when the entity left the viewed site but still exists (truck on the highway). */
  departed?: string;
}

export interface SiteExtras {
  summary: string;
  stock: { value: string; fraction: number };
  bays: { value: string; fraction: number };
  outboundToday: string;
  putAwaysToday: string;
  inventory: { sku: string; icon: string; name: string; qty: string; low: boolean }[];
  fleet: { value: string; rows: { id: string; name: string; chip: ChipVM; value: number; caption: string; tone: Tone }[] };
}

export const SITE_EYEBROW: Record<SiteKind, string> = {
  depot: 'Depot',
  distribution_center: 'Distribution Center',
  cold_store: 'Cold Store',
  cross_dock: 'Cross-Dock',
  automated_dc: 'Automated DC',
};

// --- chips (spec 4.6 colour table) -------------------------------------------

const TRUCK_CHIP: Record<Truck['state'], ChipVM> = {
  en_route: { tone: 'info', text: 'En route' },
  at_gate: { tone: 'warning', text: 'At gate' },
  docking: { tone: 'info', text: 'Docking' },
  unloading: { tone: 'success', text: 'Unloading' },
  loading: { tone: 'success', text: 'Loading' },
  departing: { tone: 'info', text: 'Departing' },
  in_transit: { tone: 'info', text: 'In transit' },
  delivered: { tone: 'neutral', text: 'Delivered' },
};
export const truckChip = (t: Truck): ChipVM => TRUCK_CHIP[t.state];

const FORKLIFT_CHIP: Record<Forklift['state'], ChipVM> = {
  idle: { tone: 'neutral', text: 'Idle' },
  fetching: { tone: 'info', text: 'Picking up' },
  loading_truck: { tone: 'success', text: 'Loading truck' },
  unloading_truck: { tone: 'success', text: 'Unloading truck' },
  returning: { tone: 'neutral', text: 'Returning' },
  queued_for_charger: { tone: 'warning', text: 'Waiting to charge' },
  charging: { tone: 'warning', text: 'Charging' },
};
export const forkliftChip = (f: Forklift): ChipVM => FORKLIFT_CHIP[f.state];

const PALLET_CHIP: Record<Pallet['state'], ChipVM> = {
  in_rack: { tone: 'neutral', text: 'In rack' },
  staged: { tone: 'neutral', text: 'Staged' },
  moving: { tone: 'info', text: 'Moving' },
  loaded: { tone: 'neutral', text: 'Loaded' },
};
export const palletChip = (p: Pallet): ChipVM => PALLET_CHIP[p.state];

export const chargerChip = (c: Charger): ChipVM =>
  c.forkliftId ? { tone: 'warning', text: `Charging ${c.forkliftId}` } : { tone: 'success', text: 'Free' };

// --- helpers ------------------------------------------------------------------

const siteOf = (world: World, id: string) => world.sites.find((s) => s.id === id);
export const dockLabel = (site: Site | undefined, dockId?: string) => site?.docks.find((d) => d.id === dockId)?.label ?? null;
export const timeAt = (world: World, simSeconds: number) => hhmm(new Date(world.startEpochMs + simSeconds * 1000));
export const carrierName = (world: World, t: Truck) => world.carriers.find((c) => c.id === t.carrierId)?.name ?? '';
const EMPTY = '—';

export function palletLocation(p: Pallet): string {
  const { kind, ref } = p.location;
  if (kind === 'forklift') return `On forks of ${ref}`;
  if (kind === 'truck') return `Trailer ${ref}`;
  if (ref === 'rack') return 'Racking';
  return `Yard slot ${Number(ref.replace('yard-', '')) + 1}`;
}

/** What a forklift is doing, for the fleet board and the card ("Unloading TRK-2205 at Bay 2"). */
export function forkliftTask(world: World, f: Forklift): string {
  const site = siteOf(world, f.siteId);
  const bay = dockLabel(site, f.task?.dockId) ?? '';
  switch (f.state) {
    case 'fetching':
      return `Picking up for ${f.task?.truckId ?? ''}`;
    case 'loading_truck':
      return `Loading ${f.task?.truckId ?? ''} at ${bay}`;
    case 'unloading_truck':
      return `Unloading ${f.task?.truckId ?? ''} at ${bay}`;
    case 'returning':
      return 'Returning to base';
    case 'queued_for_charger':
      return `Waiting for ${f.chargerId ?? 'a charger'}`;
    case 'charging':
      return `Charging at ${f.chargerId ?? ''}`;
    default:
      return 'Idle at base';
  }
}

/** One line under the truck chip (spec 4.4: "Reversing into Bay 3"). */
export function truckDesc(world: World, t: Truck): string {
  const site = siteOf(world, t.homeSiteId);
  const bay = dockLabel(site, t.dockId);
  const shipment = world.shipments.get(t.shipmentId);
  switch (t.state) {
    case 'en_route':
      return `Heading to ${t.homeSiteId} gate`;
    case 'at_gate':
      return bay ? `Checking in for ${bay}` : 'Waiting for a free bay';
    case 'docking':
      return `Reversing into ${bay ?? 'bay'}`;
    case 'unloading':
      return `Unloading at ${bay ?? 'bay'}`;
    case 'loading':
      return `Loading at ${bay ?? 'bay'}`;
    case 'departing':
      return `Leaving ${t.homeSiteId}`;
    case 'in_transit':
      return `On the road to ${shipment?.destination ?? 'customer'}`;
    case 'delivered':
      return `Delivered to ${shipment?.customer ?? 'customer'}`;
  }
}

// --- cards ----------------------------------------------------------------------

export function siteCard(world: World, site: Site): CardVM {
  const sum = siteSummary(world, site.id);
  const stock = stockOnHand(world, site.id);
  const fleet = [...world.forklifts.values()].filter((f) => f.siteId === site.id);
  return {
    sel: { kind: 'site', id: site.id },
    siteId: site.id,
    eyebrow: `${SITE_EYEBROW[site.kind]} · ${site.id}`,
    title: site.name,
    subtitle: site.address,
    chip: { tone: 'success', text: 'Operational' },
    fields: [],
    site: {
      summary: `${sum.docked} docked · ${sum.arriving} arriving · ${sum.staged} staged`,
      stock: { value: `${fmtInt(stock)} / ${fmtInt(site.capacity)}`, fraction: stock / site.capacity },
      bays: { value: `${sum.busyBays} / ${sum.totalBays} busy`, fraction: sum.totalBays ? sum.busyBays / sum.totalBays : 0 },
      outboundToday: fmtInt(site.today.outbound),
      putAwaysToday: fmtInt(site.today.putAways),
      inventory: site.inventory.map((i) => ({ sku: i.sku, icon: i.icon, name: i.name, qty: fmtInt(i.qty), low: i.qty < i.lowStockThreshold })),
      fleet: {
        value: `${sum.forkliftsWorking}/${sum.forkliftsTotal} working`,
        rows: fleet.map((f) => ({
          id: f.id,
          name: `${f.id} · ${f.driver}`,
          chip: forkliftChip(f),
          value: f.battery / 100,
          caption: `${Math.round(f.battery)}%`,
          tone: f.battery < 20 ? 'warning' : isForkliftBusy(f) ? 'info' : 'success',
        })),
      },
    },
  };
}

export function truckCard(world: World, t: Truck): CardVM {
  const shipment = world.shipments.get(t.shipmentId);
  const site = siteOf(world, t.homeSiteId);
  const bay = dockLabel(site, t.dockId);
  const p = truckProgress(t);
  const progress: CardVM['progress'] =
    p?.kind === 'pallets'
      ? { value: p.done / p.capacity, caption: `${p.done}/${p.capacity} pallets`, tone: 'success', label: 'Cargo' }
      : p?.kind === 'distance'
        ? { value: p.fraction, caption: `${fmtInt(p.remainingM)} m left`, tone: 'info', label: 'Distance' }
        : undefined;
  return {
    sel: { kind: 'truck', id: t.id },
    siteId: t.homeSiteId,
    eyebrow: carrierName(world, t),
    title: t.id,
    subtitle: `${t.driver} · ${t.plate}`,
    chip: truckChip(t),
    desc: truckDesc(world, t),
    progress,
    fields: [
      { label: 'Shipment', value: t.shipmentId },
      { label: 'Customer', value: shipment?.customer ?? EMPTY },
      { label: 'Destination', value: shipment?.destination ?? EMPTY },
      { label: 'ETA', value: shipment ? timeAt(world, shipmentDoneAt(world, shipment)) : EMPTY },
      { label: 'Speed', value: `${fmtInt(t.speedKmh)} km/h` },
      { label: 'Bay', value: bay ?? EMPTY },
      { label: 'Cargo', value: `${t.cargo.pallets}/${t.cargo.capacity} pallets · ${fmt1(t.cargo.weightKg / 1000)} t` },
    ],
    departed: t.siteId === null ? `Left ${t.homeSiteId} · heading to ${shipment?.destination ?? 'customer'}` : undefined,
  };
}

export function forkliftCard(world: World, f: Forklift): CardVM {
  const site = siteOf(world, f.siteId);
  const carrying = f.carrying ? world.pallets.get(f.carrying) : undefined;
  return {
    sel: { kind: 'forklift', id: f.id },
    siteId: f.siteId,
    eyebrow: `Forklift · ${f.siteId}`,
    title: f.id,
    subtitle: `${f.driver} · ${f.model}`,
    chip: forkliftChip(f),
    desc: forkliftTask(world, f),
    progress: {
      value: f.battery / 100,
      caption: `${Math.round(f.battery)}%`,
      tone: f.battery < 20 ? 'warning' : isForkliftBusy(f) ? 'info' : 'success',
      label: 'Battery',
    },
    fields: [
      { label: 'Carrying', value: carrying ? `${carrying.id} · ${carrying.name}` : 'Empty' },
      { label: 'Moves today', value: fmtInt(f.movesToday) },
      { label: 'Speed', value: `${fmt1(f.motion ? f.speedKmh : 0)} km/h` },
      { label: 'Charger', value: f.chargerId ?? site?.chargers[0]?.id ?? EMPTY },
      { label: 'Site', value: `${f.siteId} · ${site?.name ?? ''}` },
    ],
  };
}

export function palletCard(world: World, p: Pallet): CardVM {
  const site = siteOf(world, p.siteId);
  return {
    sel: { kind: 'pallet', id: p.id },
    siteId: p.siteId,
    eyebrow: `Pallet · ${p.category}`,
    title: p.name,
    subtitle: `${p.id} · ${p.sku}`,
    chip: palletChip(p),
    fields: [
      { label: 'Quantity', value: fmtInt(p.qty) },
      { label: 'Gross weight', value: `${fmtInt(p.weightKg)} kg` },
      { label: 'Location', value: palletLocation(p) },
      { label: 'Lot', value: p.lot },
      { label: 'Received', value: timeAt(world, p.receivedAt) },
      { label: 'Site', value: `${p.siteId} · ${site?.name ?? ''}` },
    ],
  };
}

export function chargerCard(world: World, site: Site, chargerId: string): CardVM | null {
  const c = site.chargers.find((x) => x.id === chargerId);
  if (!c) return null;
  const occupant = c.forkliftId ? world.forklifts.get(c.forkliftId) : undefined;
  const charging = occupant?.state === 'charging' && !occupant.motion;
  return {
    sel: { kind: 'charger', id: chargerSelId(site.id, c.id) },
    siteId: site.id,
    eyebrow: `Charger · ${site.id}`,
    title: c.id,
    subtitle: c.label,
    chip: chargerChip(c),
    progress: charging && occupant ? { value: occupant.battery / 100, caption: `${Math.round(occupant.battery)}%`, tone: 'info', label: `${occupant.id} battery` } : undefined,
    fields: [
      { label: 'Sessions today', value: fmtInt(c.sessionsToday) },
      { label: 'Energy today', value: `${fmt1(c.energyKwhToday)} kWh` },
      { label: 'Charge rate', value: `${fmt1(c.ratePctPerMin)} %/min` },
      { label: 'Queue', value: c.queue.length ? c.queue.join(', ') : 'None' },
      { label: 'Site', value: `${site.id} · ${site.name}` },
    ],
  };
}

/** Card for a selection, or null when the entity no longer exists (caller keeps the last one). */
export function cardFor(world: World, sel: Sel): CardVM | null {
  switch (sel.kind) {
    case 'site': {
      const s = siteOf(world, sel.id);
      return s ? siteCard(world, s) : null;
    }
    case 'truck': {
      const t = world.trucks.get(sel.id);
      return t ? truckCard(world, t) : null;
    }
    case 'forklift': {
      const f = world.forklifts.get(sel.id);
      return f ? forkliftCard(world, f) : null;
    }
    case 'pallet': {
      const p = world.pallets.get(sel.id);
      return p ? palletCard(world, p) : null;
    }
    case 'charger': {
      const [siteId, chargerId] = sel.id.split('/');
      const s = siteOf(world, siteId ?? '');
      return s && chargerId ? chargerCard(world, s, chargerId) : null;
    }
  }
}

export const simClockLabel = (world: World) => hhmm(simDate(world));
