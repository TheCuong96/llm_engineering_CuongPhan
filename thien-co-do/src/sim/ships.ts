// Spirit-ship lifecycle (spec §7.3), shared by both directions:
//   sailing → at_barrier → landing → unloading|loading → departing → in_transit → delivered
// Pads: free → reserved (ship waiting at the gate) → occupied (landed) → free (departing).

import { distance, motionDone, motionPos, startMotion } from './geometry';
import type { Rng } from './rng';
import {
  createChest,
  emit,
  getPeak,
  peakDistanceLi,
  sharedSkus,
  markOrderStep,
  setPadState,
  setShipState,
  type World,
} from './state';
import type { Direction, Peak, Ship, TransportOrder } from './types';
import {
  BARRIER_COST_PER_OPEN,
  BARRIER_WEAK_SLOWDOWN,
  CARGO_CAPACITY,
  DELIVERED_LINGER_S,
  DUE_SLACK,
  EXTRA_SHIPS_PER_PEAK,
  GATE_WAIT_S,
  HANDLING_EST_S_PER_CHEST,
  SHIP_LAND_MPS,
  SHIP_SAIL_MPS,
  SHIP_TRANSIT_MPS,
  TRANSFER_SHARE,
  TRANSIT_ALTITUDE,
} from './tuning';

const M_PER_LI = 500; // keep in step with data/units.ts; sim must not import data

/** Gate wait once a pad is reserved; doubled while the barrier is weak. */
export function gateWaitSec(rng: Rng, weak: boolean): number {
  return rng.range(GATE_WAIT_S[0], GATE_WAIT_S[1]) * (weak ? BARRIER_WEAK_SLOWDOWN : 1);
}

export function spawnShip(world: World, peak: Peak, direction: Direction, chests?: number, destPeakId?: string): Ship {
  const { rng } = world;
  world.counters.ship += rng.int(1, 9);
  world.counters.order += rng.int(1, 40);
  const id = `LC-${world.counters.ship}`;
  const orderId = `#LVC-${world.counters.order}`;
  const n = chests ?? rng.int(3, CARGO_CAPACITY);
  const from = peak.geometry.approachFrom;
  const start: [number, number, number] = [from[0], from[1] + rng.range(-8, 8), from[2] + rng.range(-60, 60)];

  const ship: Ship = {
    id,
    guildId: rng.pick(world.guilds).id,
    captain: rng.pick(world.captains),
    sealNo: `${rng.int(100, 999)}-${rng.int(10, 99)}`,
    peakId: peak.id,
    homePeakId: peak.id,
    state: 'sailing',
    direction,
    orderId,
    pos: start,
    cargo: { chests: 0, capacity: CARGO_CAPACITY, weightKg: 0 },
    speedMps: SHIP_SAIL_MPS,
    motion: startMotion(start, peak.geometry.gate, world.t, SHIP_SAIL_MPS),
    handling: { target: n, done: 0, assigned: 0 },
    destPeakId: direction === 'outbound' ? destPeakId : undefined,
  };

  if (direction === 'inbound') {
    const skus = peak.inventory.map((i) => i.sku);
    for (let i = 0; i < n; i++) {
      const chest = createChest(world, peak.id, rng.pick(skus), 'loaded', { kind: 'ship', ref: id });
      ship.cargo.chests += 1;
      ship.cargo.weightKg += chest.weightKg;
    }
  }

  newOrder(world, peak, ship, n);

  world.ships.set(id, ship);
  emit(world, 'ship_spawned', peak.id, id, { direction, chests: n, orderId });
  markOrderStep(world, world.orders.get(orderId)!, 'accepted');
  return ship;
}

/** Builds and registers the ship's order: outside town, another peak (transfer), or this peak (inbound). */
function newOrder(world: World, peak: Peak, ship: Ship, n: number): TransportOrder {
  const outbound = ship.direction === 'outbound';
  const dest = ship.destPeakId ? getPeak(world, ship.destPeakId) : undefined;
  const town = outbound && !dest ? world.rng.pick(world.recipients) : undefined;
  const li = dest ? peakDistanceLi(world, peak.id, dest.id) : (town?.distanceLi ?? 0);
  const transitS = (li * M_PER_LI) / SHIP_TRANSIT_MPS;
  const estimate =
    (ship.motion?.duration ?? 0) +
    (GATE_WAIT_S[0] + GATE_WAIT_S[1]) / 2 +
    n * HANDLING_EST_S_PER_CHEST +
    distance(peak.geometry.gate, peak.geometry.exitTo) / SHIP_SAIL_MPS +
    (outbound ? transitS : 0);
  const name = dest?.name ?? town?.name ?? peak.name;
  const order: TransportOrder = {
    id: ship.orderId,
    peakId: peak.id,
    recipient: name,
    destination: name,
    destPeakId: dest?.id,
    shipId: ship.id,
    direction: ship.direction,
    steps: [{ key: 'accepted' }, { key: 'inspected' }, { key: 'handling' }, { key: 'in_flight' }, { key: 'delivered' }],
    dueAt: world.t + estimate * DUE_SLACK,
    late: false,
  };
  world.orders.set(order.id, order);
  return order;
}

/** Sky-route flight time for an order: to another peak (distance table) or an outside town. */
export function transitSeconds(world: World, order: TransportOrder): number {
  const li = order.destPeakId
    ? peakDistanceLi(world, order.peakId, order.destPeakId)
    : (world.recipients.find((r) => r.name === order.destination)?.distanceLi ?? 30);
  return (li * M_PER_LI) / SHIP_TRANSIT_MPS;
}

/**
 * A transfer reached its destination: its outbound order is delivered there, and the same
 * ship continues as the destination's inbound ship under a fresh order (spec §7.4).
 */
function rehome(world: World, ship: Ship): void {
  const from = ship.homePeakId;
  const dest = getPeak(world, ship.destPeakId!);
  world.orders.delete(ship.orderId);
  world.counters.order += world.rng.int(1, 40);
  ship.orderId = '#LVC-' + world.counters.order;
  ship.homePeakId = dest.id;
  ship.peakId = dest.id;
  ship.direction = 'inbound';
  ship.destPeakId = undefined;
  ship.eta = undefined;
  ship.route = undefined;
  ship.speedMps = SHIP_SAIL_MPS;
  ship.motion = startMotion(ship.pos, dest.geometry.gate, world.t, SHIP_SAIL_MPS);
  ship.handling = { target: ship.cargo.chests, done: 0, assigned: 0 };
  for (const c of world.chests.values()) {
    if (c.location.kind === 'ship' && c.location.ref === ship.id) c.peakId = dest.id;
  }
  const order = newOrder(world, dest, ship, ship.cargo.chests);
  emit(world, 'ship_rehomed', dest.id, ship.id, { from, to: dest.id, orderId: order.id });
  markOrderStep(world, order, 'accepted');
  setShipState(world, ship, 'sailing');
}

function orderOf(world: World, ship: Ship): TransportOrder {
  const order = world.orders.get(ship.orderId);
  if (!order) throw new Error(`ship ${ship.id} lost order ${ship.orderId}`);
  return order;
}

function completeOrder(world: World, ship: Ship): void {
  const order = orderOf(world, ship);
  markOrderStep(world, order, 'delivered');
  const peak = getPeak(world, ship.homePeakId);
  peak.orderStats.delivered += 1;
  if (world.t <= order.dueAt) peak.orderStats.onTime += 1;
}

function tryOpenGate(world: World, peak: Peak, ship: Ship): void {
  if (!ship.padId) {
    const want = ship.direction === 'inbound' ? 'in' : 'out';
    const pad = peak.pads.find((p) => p.state === 'free' && p.direction === want);
    if (!pad) return; // wait in the queue at the barrier
    ship.padId = pad.id;
    setPadState(world, peak, pad, 'reserved', ship.id);
    ship.gateOpensAt = world.t + gateWaitSec(world.rng, peak.barrier.weak);
  }
  if (ship.gateOpensAt === undefined || world.t < ship.gateOpensAt) return;

  peak.barrier.strength = Math.max(0, peak.barrier.strength - BARRIER_COST_PER_OPEN);
  emit(world, 'barrier_opened', peak.id, ship.id, { strength: peak.barrier.strength });
  markOrderStep(world, orderOf(world, ship), 'inspected');
  const pad = peak.pads.find((p) => p.id === ship.padId)!;
  ship.gateOpensAt = undefined;
  ship.speedMps = SHIP_LAND_MPS;
  ship.motion = startMotion(ship.pos, pad.pos, world.t, SHIP_LAND_MPS);
  setShipState(world, ship, 'landing');
}

function depart(world: World, peak: Peak, ship: Ship): void {
  const pad = peak.pads.find((p) => p.id === ship.padId);
  if (pad) setPadState(world, peak, pad, 'free');
  ship.padId = undefined;
  ship.speedMps = SHIP_SAIL_MPS;
  ship.motion = startMotion(ship.pos, peak.geometry.exitTo, world.t, SHIP_SAIL_MPS);
  markOrderStep(world, orderOf(world, ship), 'in_flight');
  setShipState(world, ship, 'departing');
}

export function updateShips(world: World): void {
  const { t } = world;
  for (const ship of [...world.ships.values()]) {
    if (ship.motion) ship.pos = motionPos(ship.motion, t);
    const arrived = ship.motion ? motionDone(ship.motion, t) : false;
    const peak = getPeak(world, ship.homePeakId);

    switch (ship.state) {
      case 'sailing':
        if (arrived) {
          ship.motion = undefined;
          setShipState(world, ship, 'at_barrier');
        }
        break;
      case 'at_barrier':
        tryOpenGate(world, peak, ship);
        break;
      case 'landing':
        if (arrived) {
          ship.motion = undefined;
          const pad = peak.pads.find((p) => p.id === ship.padId)!;
          setPadState(world, peak, pad, 'occupied', ship.id);
          markOrderStep(world, orderOf(world, ship), 'handling');
          setShipState(world, ship, ship.direction === 'inbound' ? 'unloading' : 'loading');
        }
        break;
      case 'unloading':
      case 'loading':
        if (ship.handling.assigned === 0 && ship.handling.done >= ship.handling.target) depart(world, peak, ship);
        break;
      case 'departing':
        if (arrived) {
          ship.motion = undefined;
          ship.peakId = null;
          ship.speedMps = SHIP_TRANSIT_MPS;
          const order = orderOf(world, ship);
          const flightS = transitSeconds(world, order);
          ship.eta = t + flightS;
          if (ship.destPeakId) {
            // Visible sky route between peaks; timing follows the distance table, not world metres.
            const [bx, , bz] = getPeak(world, ship.destPeakId).geometry.approachFrom;
            const to: [number, number, number] = [bx, TRANSIT_ALTITUDE, bz];
            ship.route = [ship.pos, to];
            ship.motion = { from: ship.pos, to, start: t, duration: flightS };
          }
          // Inbound orders end once the goods are in and the ship has cleared the barrier.
          if (ship.direction === 'inbound') completeOrder(world, ship);
          setShipState(world, ship, 'in_transit');
        }
        break;
      case 'in_transit':
        if (ship.eta !== undefined && t >= ship.eta) {
          if (ship.direction === 'outbound') completeOrder(world, ship);
          if (ship.destPeakId) {
            rehome(world, ship);
            break;
          }
          ship.eta = t + DELIVERED_LINGER_S;
          setShipState(world, ship, 'delivered');
        }
        break;
      case 'delivered':
        if (ship.eta !== undefined && t >= ship.eta) removeShip(world, ship);
        break;
    }
  }
}

function removeShip(world: World, ship: Ship): void {
  for (const chest of [...world.chests.values()]) {
    if (chest.location.kind === 'ship' && chest.location.ref === ship.id) world.chests.delete(chest.id);
  }
  world.ships.delete(ship.id);
  world.orders.delete(ship.orderId);
  emit(world, 'ship_removed', ship.homePeakId, ship.id);
}

export function maybeSpawn(world: World, peak: Peak): void {
  if (world.t < peak.nextArrivalAt) return;
  const [lo, hi] = peak.arrivalEveryMin;
  peak.nextArrivalAt = world.t + world.rng.range(lo, hi) * 60;
  let active = 0;
  for (const s of world.ships.values()) if (s.homePeakId === peak.id && s.peakId !== null) active++;
  if (active >= peak.pads.length + EXTRA_SHIPS_PER_PEAK) return;
  const direction = world.rng.next() < peak.outboundShare ? 'outbound' : 'inbound';
  let dest: string | undefined;
  if (direction === 'outbound' && world.rng.next() < TRANSFER_SHARE) {
    const options = world.peaks.filter((p) => p.id !== peak.id && sharedSkus(peak, p).length > 0);
    if (options.length) dest = world.rng.pick(options).id;
  }
  spawnShip(world, peak, direction, undefined, dest);
}

export function checkLateOrders(world: World): void {
  for (const order of world.orders.values()) {
    if (order.late || world.t <= order.dueAt) continue;
    if (order.steps.at(-1)?.at !== undefined) continue;
    order.late = true;
    emit(world, 'ship_late', order.peakId, order.shipId, { orderId: order.id });
  }
}
