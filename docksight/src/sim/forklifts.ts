// Forklift lifecycle (spec 7.3):
//   idle → fetching → loading_truck | unloading_truck → returning → idle
//   idle with battery < 20% → charging (drive to a free charger, then charge) → idle at ≥ 95%
//   no free charger → queued_for_charger until one frees up
// Pallets: in_rack | staged → moving → loaded (outbound); loaded → moving → staged | in_rack (inbound).

import { TICK_DT } from './clock';
import { pickCharger } from './chargers';
import { motionDone, motionPos, startMotion, type Vec3 } from './geometry';
import {
  createPallet,
  emit,
  getSite,
  putIntoInventory,
  setForkliftState,
  setPalletState,
  slotPos,
  takeFromInventory,
  type World,
} from './state';
import type { Charger, Forklift, Pallet, Site, Truck } from './types';
import { BATTERY_CHARGED, BATTERY_COST_PER_MOVE, BATTERY_KWH, BATTERY_LOW } from './tuning';

function driveTo(world: World, fl: Forklift, to: Vec3): void {
  fl.motion = startMotion(fl.pos, to, world.t, fl.speedKmh / 3.6);
}

function apronOf(site: Site, truck: Truck): Vec3 {
  const dock = site.docks.find((d) => d.id === truck.dockId);
  if (!dock) throw new Error(`truck ${truck.id} has no dock`);
  return dock.apron;
}

function pallet(world: World, id: string | undefined): Pallet {
  const p = id ? world.pallets.get(id) : undefined;
  if (!p) throw new Error(`missing pallet ${id}`);
  return p;
}

function truck(world: World, id: string): Truck {
  const t = world.trucks.get(id);
  if (!t) throw new Error(`missing truck ${id}`);
  return t;
}

// --- chargers -------------------------------------------------------------

function seekCharger(world: World, site: Site, fl: Forklift): void {
  const choice = pickCharger(fl, site.chargers);
  if (!choice) return; // site without chargers: forklift stays idle and flat
  if (choice.queue) {
    choice.charger.queue.push(fl.id);
    fl.chargerId = choice.charger.id;
    fl.motion = undefined;
    setForkliftState(world, fl, 'queued_for_charger');
  } else {
    plugIn(world, fl, choice.charger);
  }
}

function plugIn(world: World, fl: Forklift, charger: Charger): void {
  charger.forkliftId = fl.id;
  fl.chargerId = charger.id;
  driveTo(world, fl, charger.pos);
  setForkliftState(world, fl, 'charging');
}

function unplug(world: World, site: Site, fl: Forklift): void {
  const charger = site.chargers.find((c) => c.id === fl.chargerId)!;
  charger.forkliftId = undefined;
  charger.sessionsToday += 1;
  fl.chargerId = undefined;
  driveTo(world, fl, site.geometry.home);
  setForkliftState(world, fl, 'idle');

  const nextId = charger.queue.shift();
  const next = nextId ? world.forklifts.get(nextId) : undefined;
  if (next) plugIn(world, next, charger);
}

// --- moves ----------------------------------------------------------------

function spendBattery(world: World, fl: Forklift): void {
  const before = fl.battery;
  fl.battery = Math.max(0, fl.battery - BATTERY_COST_PER_MOVE);
  fl.movesToday += 1;
  if (before >= BATTERY_LOW && fl.battery < BATTERY_LOW) emit(world, 'battery_low', fl.siteId, fl.id, { battery: fl.battery });
}

function finishMove(world: World, site: Site, fl: Forklift, tr: Truck): void {
  tr.handling.done += 1;
  tr.handling.assigned -= 1;
  fl.carrying = undefined;
  fl.task = undefined;
  spendBattery(world, fl);
  driveTo(world, fl, site.geometry.home);
  setForkliftState(world, fl, 'returning');
}

function freeYardSlot(world: World, site: Site): string {
  const taken = new Set<string>();
  for (const p of world.pallets.values()) {
    if (p.siteId === site.id && p.location.kind === 'slot') taken.add(p.location.ref);
  }
  for (const f of world.forklifts.values()) if (f.task?.slotRef) taken.add(f.task.slotRef);
  const i = site.geometry.yardSlots.findIndex((_, idx) => !taken.has(`yard-${idx}`));
  return i === -1 ? 'rack' : `yard-${i}`;
}

function onArrive(world: World, site: Site, fl: Forklift): void {
  switch (fl.state) {
    case 'fetching': {
      const tr = truck(world, fl.task!.truckId);
      const p = pallet(world, fl.task!.palletId);
      setPalletState(world, p, 'moving', { kind: 'forklift', ref: fl.id });
      fl.carrying = p.id;
      if (tr.direction === 'outbound') {
        driveTo(world, fl, apronOf(site, tr));
        setForkliftState(world, fl, 'loading_truck');
      } else {
        tr.cargo.pallets -= 1;
        tr.cargo.weightKg -= p.weightKg;
        site.today.putAways += 1; // counts as received once it is off the truck
        const slotRef = freeYardSlot(world, site);
        fl.task!.slotRef = slotRef;
        driveTo(world, fl, slotPos(site, slotRef));
        setForkliftState(world, fl, 'unloading_truck');
      }
      break;
    }
    case 'loading_truck': {
      const tr = truck(world, fl.task!.truckId);
      const p = pallet(world, fl.carrying);
      p.reservedBy = undefined;
      setPalletState(world, p, 'loaded', { kind: 'truck', ref: tr.id });
      tr.cargo.pallets += 1;
      tr.cargo.weightKg += p.weightKg;
      site.today.outbound += 1;
      finishMove(world, site, fl, tr);
      break;
    }
    case 'unloading_truck': {
      const tr = truck(world, fl.task!.truckId);
      const p = pallet(world, fl.carrying);
      const slotRef = fl.task!.slotRef!;
      p.reservedBy = undefined;
      p.receivedAt = world.t;
      if (slotRef === 'rack') {
        // Yard full: the pallet goes straight into the racking and back into aggregate stock.
        setPalletState(world, p, 'in_rack', { kind: 'slot', ref: 'rack' });
        world.pallets.delete(p.id);
        putIntoInventory(site, p.sku);
      } else {
        setPalletState(world, p, 'staged', { kind: 'slot', ref: slotRef });
      }
      finishMove(world, site, fl, tr);
      break;
    }
    case 'returning':
      setForkliftState(world, fl, 'idle');
      break;
    default:
      break;
  }
}

export function updateForklifts(world: World): void {
  for (const fl of world.forklifts.values()) {
    const site = getSite(world, fl.siteId);
    let arrived = false;
    if (fl.motion) {
      fl.pos = motionPos(fl.motion, world.t);
      if (motionDone(fl.motion, world.t)) {
        fl.motion = undefined;
        arrived = true;
      }
    }

    if (arrived) onArrive(world, site, fl);

    if (fl.state === 'idle' && fl.battery < BATTERY_LOW) {
      seekCharger(world, site, fl);
    } else if (fl.state === 'charging' && !fl.motion) {
      const charger = site.chargers.find((c) => c.id === fl.chargerId)!;
      const next = Math.min(100, fl.battery + (charger.ratePctPerMin / 60) * TICK_DT);
      charger.energyKwhToday += ((next - fl.battery) / 100) * BATTERY_KWH;
      fl.battery = next;
      if (fl.battery >= BATTERY_CHARGED) unplug(world, site, fl);
    }
  }
}

// --- dispatch -------------------------------------------------------------

function sourcePalletForLoading(world: World, site: Site): Pallet | undefined {
  for (const p of world.pallets.values()) {
    if (p.siteId === site.id && p.state === 'staged' && !p.reservedBy) return p;
  }
  const item = [...site.inventory].filter((i) => i.qty > 0).sort((a, b) => b.qty - a.qty)[0];
  if (!item || !takeFromInventory(world, site, item.sku)) return undefined;
  return createPallet(world, site.id, item.sku, 'in_rack', { kind: 'slot', ref: 'rack' });
}

function nextPalletOnTruck(world: World, tr: Truck): Pallet | undefined {
  for (const p of world.pallets.values()) {
    if (p.location.kind === 'truck' && p.location.ref === tr.id && !p.reservedBy) return p;
  }
  return undefined;
}

/** Hand idle, charged forklifts to docked trucks that still need pallets moved. */
export function dispatchForklifts(world: World): void {
  for (const site of world.sites) {
    const idle = [...world.forklifts.values()].filter(
      (f) => f.siteId === site.id && f.state === 'idle' && f.battery >= BATTERY_LOW,
    );
    if (idle.length === 0) continue;

    for (const tr of world.trucks.values()) {
      if (tr.siteId !== site.id || (tr.state !== 'loading' && tr.state !== 'unloading')) continue;
      while (idle.length > 0 && tr.handling.done + tr.handling.assigned < tr.handling.target) {
        const p = tr.state === 'unloading' ? nextPalletOnTruck(world, tr) : sourcePalletForLoading(world, site);
        if (!p) {
          // Nothing left to move (stock ran dry): close out with what is aboard.
          tr.handling.target = tr.handling.done + tr.handling.assigned;
          break;
        }
        const fl = idle.shift()!;
        p.reservedBy = fl.id;
        tr.handling.assigned += 1;
        fl.task = { truckId: tr.id, dockId: tr.dockId!, palletId: p.id };
        driveTo(world, fl, tr.state === 'unloading' ? apronOf(site, tr) : slotPos(site, p.location.ref));
        setForkliftState(world, fl, 'fetching');
      }
    }
  }
}
