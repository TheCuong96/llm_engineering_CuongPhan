// Truck lifecycle (spec 7.3):
//   inbound:  en_route → at_gate → docking → unloading → departing → (leaves the map)
//   outbound: en_route → at_gate → docking → loading → departing → in_transit → delivered
//   transfer: an outbound truck whose destination is another site; on arrival it becomes that
//             site's inbound truck (en_route from the map edge) under a new shipment (spec 7.4).
// Docks: available → reserved (truck checked in at the gate) → occupied (backed in) → available.

import { distance, motionDone, motionPos, startMotion, type Vec3 } from './geometry';
import type { Rng } from './rng';
import {
  createPallet,
  emit,
  getSite,
  markShipmentStep,
  setDockState,
  setTruckState,
  sharedSkus,
  siteDistanceKm,
  type World,
} from './state';
import type { Direction, Shipment, Site, Truck } from './types';
import {
  CARGO_CAPACITY,
  DELIVERED_LINGER_S,
  DOCKING_KMH,
  DUE_SLACK,
  EXTRA_TRUCKS_PER_SITE,
  GATE_CHECKIN_S,
  HANDLING_EST_S_PER_PALLET,
  HIGHWAY_KMH,
  ROAD_KMH,
  TRANSFER_SHARE,
  YARD_KMH,
} from './tuning';

const mps = (kmh: number) => kmh / 3.6;

function drive(world: World, truck: Truck, to: Vec3, kmh: number): void {
  truck.speedKmh = kmh;
  truck.motion = startMotion(truck.pos, to, world.t, mps(kmh));
}

export function gateCheckinSec(rng: Rng): number {
  return rng.range(GATE_CHECKIN_S[0], GATE_CHECKIN_S[1]);
}

function plate(rng: Rng): string {
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const letters = Array.from({ length: 3 }, () => L[rng.int(0, L.length - 1)]).join('');
  return `${letters}-${rng.int(1000, 9999)}`;
}

export function spawnTruck(world: World, site: Site, direction: Direction, pallets?: number, destSiteId?: string): Truck {
  const { rng } = world;
  world.counters.truck += rng.int(1, 9);
  world.counters.shipment += rng.int(1, 40);
  const id = `TRK-${world.counters.truck}`;
  const shipmentId = `#SHP-${world.counters.shipment}`;
  const n = pallets ?? rng.int(2, CARGO_CAPACITY);
  const from = site.geometry.approachFrom;
  const start: Vec3 = [from[0] - rng.range(0, 40), from[1], from[2]];

  const truck: Truck = {
    id,
    carrierId: rng.pick(world.carriers).id,
    driver: rng.pick(world.drivers),
    plate: plate(rng),
    siteId: site.id,
    homeSiteId: site.id,
    state: 'en_route',
    direction,
    shipmentId,
    destSiteId: direction === 'outbound' ? destSiteId : undefined,
    pos: start,
    cargo: { pallets: 0, capacity: CARGO_CAPACITY, weightKg: 0 },
    speedKmh: ROAD_KMH,
    handling: { target: n, done: 0, assigned: 0 },
  };
  drive(world, truck, site.geometry.gate, ROAD_KMH);

  if (direction === 'inbound') {
    const skus = site.inventory.map((i) => i.sku);
    for (let i = 0; i < n; i++) {
      const p = createPallet(world, site.id, rng.pick(skus), 'loaded', { kind: 'truck', ref: id });
      truck.cargo.pallets += 1;
      truck.cargo.weightKg += p.weightKg;
    }
  }

  newShipment(world, site, truck, n);
  world.trucks.set(id, truck);
  emit(world, 'truck_spawned', site.id, id, { direction, pallets: n, shipmentId });
  markShipmentStep(world, shipmentOf(world, truck), 'confirmed');
  return truck;
}

/** Builds the truck's shipment: to a customer, to another site (transfer), or into this site (inbound). */
function newShipment(world: World, site: Site, truck: Truck, n: number): Shipment {
  const outbound = truck.direction === 'outbound';
  const dest = truck.destSiteId ? getSite(world, truck.destSiteId) : undefined;
  const customer = outbound && !dest ? world.rng.pick(world.customers) : undefined;
  const km = dest ? siteDistanceKm(world, site.id, dest.id) : (customer?.distanceKm ?? 0);
  const transitS = outbound ? (km / HIGHWAY_KMH) * 3600 : 0;
  const estimate =
    (truck.motion?.duration ?? 0) +
    (GATE_CHECKIN_S[0] + GATE_CHECKIN_S[1]) / 2 +
    n * HANDLING_EST_S_PER_PALLET +
    distance(site.geometry.gate, site.geometry.exitTo) / mps(YARD_KMH) +
    transitS;
  const shipment: Shipment = {
    id: truck.shipmentId,
    siteId: site.id,
    customer: dest?.name ?? customer?.name ?? site.name,
    destination: dest ? `${dest.id} · ${dest.name}` : (customer?.city ?? site.address),
    truckId: truck.id,
    direction: truck.direction,
    destSiteId: dest?.id,
    steps: [{ key: 'confirmed' }, { key: 'picked' }, { key: 'handling' }, { key: 'in_transit' }, { key: 'delivered' }],
    dueAt: world.t + estimate * DUE_SLACK,
    late: false,
  };
  world.shipments.set(shipment.id, shipment);
  return shipment;
}

/** Highway time for a shipment: to another site (distance table) or to a customer. */
export function transitSeconds(world: World, shipment: Shipment): number {
  const km = shipment.destSiteId
    ? siteDistanceKm(world, shipment.siteId, shipment.destSiteId)
    : (world.customers.find((c) => c.name === shipment.customer)?.distanceKm ?? 40);
  return (km / HIGHWAY_KMH) * 3600;
}

/**
 * A transfer reached its destination: its outbound shipment is delivered there, and the same
 * truck appears at the destination's map edge as its inbound truck under a fresh shipment.
 */
function rehome(world: World, truck: Truck): void {
  const from = truck.homeSiteId;
  const dest = getSite(world, truck.destSiteId!);
  world.shipments.delete(truck.shipmentId);
  world.counters.shipment += world.rng.int(1, 40);
  truck.shipmentId = `#SHP-${world.counters.shipment}`;
  truck.homeSiteId = dest.id;
  truck.siteId = dest.id;
  truck.direction = 'inbound';
  truck.destSiteId = undefined;
  truck.eta = undefined;
  truck.pos = [...dest.geometry.approachFrom];
  drive(world, truck, dest.geometry.gate, ROAD_KMH);
  truck.handling = { target: truck.cargo.pallets, done: 0, assigned: 0 };
  for (const p of world.pallets.values()) {
    if (p.location.kind === 'truck' && p.location.ref === truck.id) p.siteId = dest.id;
  }
  const shipment = newShipment(world, dest, truck, truck.cargo.pallets);
  emit(world, 'truck_rehomed', dest.id, truck.id, { from, to: dest.id, shipmentId: shipment.id });
  markShipmentStep(world, shipment, 'confirmed');
  setTruckState(world, truck, 'en_route');
}

export function shipmentOf(world: World, truck: Truck): Shipment {
  const s = world.shipments.get(truck.shipmentId);
  if (!s) throw new Error(`truck ${truck.id} lost shipment ${truck.shipmentId}`);
  return s;
}

function completeShipment(world: World, truck: Truck): void {
  const shipment = shipmentOf(world, truck);
  markShipmentStep(world, shipment, 'delivered');
  const site = getSite(world, truck.homeSiteId);
  site.shipmentStats.delivered += 1;
  if (world.t <= shipment.dueAt) site.shipmentStats.onTime += 1;
}

function dockOf(site: Site, truck: Truck) {
  const dock = site.docks.find((d) => d.id === truck.dockId);
  if (!dock) throw new Error(`truck ${truck.id} has no dock`);
  return dock;
}

function tryCheckIn(world: World, site: Site, truck: Truck): void {
  if (!truck.dockId) {
    const want = truck.direction === 'inbound' ? 'in' : 'out';
    const dock = site.docks.find((d) => d.state === 'available' && d.direction === want);
    if (!dock) return; // queue at the gate
    truck.dockId = dock.id;
    setDockState(world, site, dock, 'reserved', truck.id);
    truck.gateClearsAt = world.t + gateCheckinSec(world.rng);
  }
  if (truck.gateClearsAt === undefined || world.t < truck.gateClearsAt) return;

  truck.gateClearsAt = undefined;
  markShipmentStep(world, shipmentOf(world, truck), 'picked');
  drive(world, truck, dockOf(site, truck).pos, DOCKING_KMH);
  setTruckState(world, truck, 'docking');
}

function depart(world: World, site: Site, truck: Truck): void {
  setDockState(world, site, dockOf(site, truck), 'available');
  truck.dockId = undefined;
  drive(world, truck, site.geometry.exitTo, YARD_KMH);
  markShipmentStep(world, shipmentOf(world, truck), 'in_transit');
  setTruckState(world, truck, 'departing');
}

export function updateTrucks(world: World): void {
  const { t } = world;
  for (const truck of [...world.trucks.values()]) {
    if (truck.motion) truck.pos = motionPos(truck.motion, t);
    const arrived = truck.motion ? motionDone(truck.motion, t) : false;
    if (arrived) truck.motion = undefined;
    const site = getSite(world, truck.homeSiteId);

    switch (truck.state) {
      case 'en_route':
        if (arrived) {
          truck.speedKmh = 0;
          setTruckState(world, truck, 'at_gate');
        }
        break;
      case 'at_gate':
        tryCheckIn(world, site, truck);
        break;
      case 'docking':
        if (arrived) {
          truck.speedKmh = 0;
          setDockState(world, site, dockOf(site, truck), 'occupied', truck.id);
          markShipmentStep(world, shipmentOf(world, truck), 'handling');
          setTruckState(world, truck, truck.direction === 'inbound' ? 'unloading' : 'loading');
        }
        break;
      case 'unloading':
      case 'loading':
        if (truck.handling.assigned === 0 && truck.handling.done >= truck.handling.target) depart(world, site, truck);
        break;
      case 'departing':
        if (arrived) {
          if (truck.direction === 'inbound') {
            // Goods are in and the empty truck has left the yard: the inbound shipment is done.
            completeShipment(world, truck);
            removeTruck(world, truck);
            break;
          }
          truck.siteId = null;
          truck.speedKmh = HIGHWAY_KMH;
          truck.eta = t + transitSeconds(world, shipmentOf(world, truck));
          setTruckState(world, truck, 'in_transit');
        }
        break;
      case 'in_transit':
        if (truck.eta !== undefined && t >= truck.eta) {
          completeShipment(world, truck);
          if (truck.destSiteId) {
            rehome(world, truck);
            break;
          }
          truck.speedKmh = 0;
          truck.eta = t + DELIVERED_LINGER_S;
          setTruckState(world, truck, 'delivered');
        }
        break;
      case 'delivered':
        if (truck.eta !== undefined && t >= truck.eta) removeTruck(world, truck);
        break;
    }
  }
}

function removeTruck(world: World, truck: Truck): void {
  for (const p of [...world.pallets.values()]) {
    if (p.location.kind === 'truck' && p.location.ref === truck.id) world.pallets.delete(p.id);
  }
  world.trucks.delete(truck.id);
  world.shipments.delete(truck.shipmentId);
  emit(world, 'truck_removed', truck.homeSiteId, truck.id);
}

export function maybeSpawn(world: World, site: Site): void {
  if (world.t < site.nextArrivalAt) return;
  const [lo, hi] = site.arrivalEveryMin;
  site.nextArrivalAt = world.t + world.rng.range(lo, hi) * 60;
  let active = 0;
  for (const tr of world.trucks.values()) if (tr.homeSiteId === site.id && tr.siteId !== null) active++;
  if (active >= site.docks.length + EXTRA_TRUCKS_PER_SITE) return;
  const direction = world.rng.next() < site.outboundShare ? 'outbound' : 'inbound';
  let dest: string | undefined;
  if (direction === 'outbound' && world.rng.next() < TRANSFER_SHARE) {
    const options = world.sites.filter((s) => s.id !== site.id && sharedSkus(site, s).length > 0);
    if (options.length) dest = world.rng.pick(options).id;
  }
  spawnTruck(world, site, direction, undefined, dest);
}

export function checkLateShipments(world: World): void {
  for (const s of world.shipments.values()) {
    if (s.late || world.t <= s.dueAt) continue;
    if (s.steps.at(-1)?.at !== undefined) continue;
    s.late = true;
    emit(world, 'truck_late', s.siteId, s.truckId, { shipmentId: s.id });
  }
}
