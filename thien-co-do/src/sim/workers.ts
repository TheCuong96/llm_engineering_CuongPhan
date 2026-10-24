// Disciple / puppet lifecycle (spec §7.3):
//   idle → fetching → loading_ship | unloading_ship → returning → idle
//   idle with qi < 20 → restoring (walk to a free array, then gather) → idle at ≥ 95
//   no free array → queued_for_array until one frees up
// Chests: in_vault | staged → carried → loaded (outbound); loaded → carried → staged (inbound).

import { distance, motionDone, motionPos, startMotion, type Vec3 } from './geometry';
import {
  createChest,
  emit,
  getPeak,
  putIntoInventory,
  setChestState,
  setWorkerState,
  sharedSkus,
  slotPos,
  takeFromInventory,
  type World,
} from './state';
import type { Chest, GatheringArray, Peak, Ship, Worker } from './types';
import { PUPPET_RESTORE_MULT, QI_COST_PER_MOVE, QI_LOW, QI_RESTORED } from './tuning';
import { TICK_DT } from './clock';

const kmh = (w: Worker) => w.speedKmh / 3.6;

function walkTo(world: World, w: Worker, to: Vec3): void {
  w.motion = startMotion(w.pos, to, world.t, kmh(w));
}

function padOf(peak: Peak, ship: Ship) {
  const pad = peak.pads.find((p) => p.id === ship.padId);
  if (!pad) throw new Error(`ship ${ship.id} has no pad`);
  return pad;
}

function chest(world: World, id: string | undefined): Chest {
  const c = id ? world.chests.get(id) : undefined;
  if (!c) throw new Error(`missing chest ${id}`);
  return c;
}

function ship(world: World, id: string): Ship {
  const s = world.ships.get(id);
  if (!s) throw new Error(`missing ship ${id}`);
  return s;
}

// --- arrays ---------------------------------------------------------------

function seekArray(world: World, peak: Peak, w: Worker): void {
  const free = peak.arrays
    .filter((a) => a.occupantId === undefined)
    .sort((a, b) => distance(w.pos, a.pos) - distance(w.pos, b.pos))[0];
  if (free) {
    occupyArray(world, w, free);
    return;
  }
  const shortest = [...peak.arrays].sort((a, b) => a.queue.length - b.queue.length)[0];
  if (!shortest) return; // peak without arrays: worker stays idle and exhausted
  shortest.queue.push(w.id);
  w.arrayId = shortest.id;
  w.motion = undefined;
  setWorkerState(world, w, 'queued_for_array');
}

function occupyArray(world: World, w: Worker, array: GatheringArray): void {
  array.occupantId = w.id;
  w.arrayId = array.id;
  walkTo(world, w, array.pos);
  setWorkerState(world, w, 'restoring');
}

function finishRestore(world: World, peak: Peak, w: Worker): void {
  const array = peak.arrays.find((a) => a.id === w.arrayId)!;
  array.occupantId = undefined;
  array.sessionsToday += 1;
  w.arrayId = undefined;
  walkTo(world, w, peak.geometry.home);
  setWorkerState(world, w, 'idle');

  const nextId = array.queue.shift();
  const next = nextId ? world.workers.get(nextId) : undefined;
  if (next) occupyArray(world, next, array);
}

// --- moves ----------------------------------------------------------------

function spendQi(world: World, w: Worker): void {
  const before = w.qi;
  w.qi = Math.max(0, w.qi - QI_COST_PER_MOVE[w.kind]);
  w.movesToday += 1;
  if (before >= QI_LOW && w.qi < QI_LOW) emit(world, 'qi_low', w.peakId, w.id, { qi: w.qi });
}

function finishMove(world: World, peak: Peak, w: Worker, s: Ship): void {
  s.handling.done += 1;
  s.handling.assigned -= 1;
  w.carrying = undefined;
  w.task = undefined;
  spendQi(world, w);
  walkTo(world, w, peak.geometry.home);
  setWorkerState(world, w, 'returning');
}

function freeYardSlot(world: World, peak: Peak): string {
  const taken = new Set<string>();
  for (const c of world.chests.values()) {
    if (c.peakId === peak.id && c.location.kind === 'slot') taken.add(c.location.ref);
  }
  for (const w of world.workers.values()) if (w.task?.slotRef) taken.add(w.task.slotRef);
  const i = peak.geometry.yardSlots.findIndex((_, idx) => !taken.has(`yard-${idx}`));
  return i === -1 ? 'vault' : `yard-${i}`;
}

function onArrive(world: World, peak: Peak, w: Worker): void {
  switch (w.state) {
    case 'fetching': {
      const s = ship(world, w.task!.shipId);
      const c = chest(world, w.task!.chestId);
      setChestState(world, c, 'carried', { kind: 'worker', ref: w.id });
      w.carrying = c.id;
      if (s.direction === 'outbound') {
        walkTo(world, w, padOf(peak, s).pos);
        setWorkerState(world, w, 'loading_ship');
      } else {
        s.cargo.chests -= 1;
        s.cargo.weightKg -= c.weightKg;
        peak.today.inChests += 1; // counts as received once it is off the ship
        const slotRef = freeYardSlot(world, peak);
        w.task!.slotRef = slotRef;
        walkTo(world, w, slotPos(peak, slotRef));
        setWorkerState(world, w, 'unloading_ship');
      }
      break;
    }
    case 'loading_ship': {
      const s = ship(world, w.task!.shipId);
      const c = chest(world, w.carrying);
      c.reservedBy = undefined;
      setChestState(world, c, 'loaded', { kind: 'ship', ref: s.id });
      s.cargo.chests += 1;
      s.cargo.weightKg += c.weightKg;
      peak.today.outChests += 1;
      finishMove(world, peak, w, s);
      break;
    }
    case 'unloading_ship': {
      const s = ship(world, w.task!.shipId);
      const c = chest(world, w.carrying);
      const slotRef = w.task!.slotRef!;
      c.reservedBy = undefined;
      c.receivedAt = world.t;
      if (slotRef === 'vault') {
        // Yard full: the chest goes straight onto the vault shelves and back into aggregate stock.
        setChestState(world, c, 'in_vault', { kind: 'slot', ref: 'vault' });
        world.chests.delete(c.id);
        putIntoInventory(peak, c.sku);
      } else {
        setChestState(world, c, 'staged', { kind: 'slot', ref: slotRef });
      }
      finishMove(world, peak, w, s);
      break;
    }
    case 'returning':
      setWorkerState(world, w, 'idle');
      break;
    default:
      break;
  }
}

export function updateWorkers(world: World): void {
  for (const w of world.workers.values()) {
    const peak = getPeak(world, w.peakId);
    let arrived = false;
    if (w.motion) {
      w.pos = motionPos(w.motion, world.t);
      if (motionDone(w.motion, world.t)) {
        w.motion = undefined;
        arrived = true;
      }
    }

    if (arrived) onArrive(world, peak, w);

    if (w.state === 'idle' && w.qi < QI_LOW) {
      seekArray(world, peak, w);
    } else if (w.state === 'restoring' && !w.motion) {
      const array = peak.arrays.find((a) => a.id === w.arrayId)!;
      const gain = (array.ratePctPerMin / 60) * TICK_DT * (w.kind === 'puppet' ? PUPPET_RESTORE_MULT : 1);
      const next = Math.min(100, w.qi + gain);
      array.qiToday += next - w.qi;
      w.qi = next;
      if (w.qi >= QI_RESTORED) finishRestore(world, peak, w);
    }
  }
}

// --- dispatch -------------------------------------------------------------

function sourceChestForLoading(world: World, peak: Peak, ship: Ship): Chest | undefined {
  // A transfer only carries what the destination keeps a line for, so it can be stored there.
  const allowed = ship.destPeakId ? new Set(sharedSkus(peak, getPeak(world, ship.destPeakId))) : null;
  const ok = (sku: string) => !allowed || allowed.has(sku);
  for (const c of world.chests.values()) {
    if (c.peakId === peak.id && c.state === 'staged' && !c.reservedBy && ok(c.sku)) return c;
  }
  const item = [...peak.inventory].filter((i) => i.qty > 0 && ok(i.sku)).sort((a, b) => b.qty - a.qty)[0];
  if (!item || !takeFromInventory(world, peak, item.sku)) return undefined;
  return createChest(world, peak.id, item.sku, 'in_vault', { kind: 'slot', ref: 'vault' });
}

function nextChestOnShip(world: World, s: Ship): Chest | undefined {
  for (const c of world.chests.values()) {
    if (c.location.kind === 'ship' && c.location.ref === s.id && !c.reservedBy) return c;
  }
  return undefined;
}

/** Hand idle, rested workers to ships that still need chests moved. */
export function dispatchWorkers(world: World): void {
  for (const peak of world.peaks) {
    const idle = [...world.workers.values()].filter(
      (w) => w.peakId === peak.id && w.state === 'idle' && w.qi >= QI_LOW,
    );
    if (idle.length === 0) continue;

    for (const s of world.ships.values()) {
      if (s.peakId !== peak.id || (s.state !== 'loading' && s.state !== 'unloading')) continue;
      while (idle.length > 0 && s.handling.done + s.handling.assigned < s.handling.target) {
        const c = s.state === 'unloading' ? nextChestOnShip(world, s) : sourceChestForLoading(world, peak, s);
        if (!c) {
          // Nothing left to move (vault ran dry): close out with what is aboard.
          s.handling.target = s.handling.done + s.handling.assigned;
          break;
        }
        const w = idle.shift()!;
        c.reservedBy = w.id;
        s.handling.assigned += 1;
        w.task = { shipId: s.id, padId: s.padId!, chestId: c.id };
        walkTo(world, w, s.state === 'unloading' ? padOf(peak, s).pos : slotPos(peak, c.location.ref));
        setWorkerState(world, w, 'fetching');
      }
    }
  }
}
