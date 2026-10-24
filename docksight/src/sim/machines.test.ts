// One test per transition family of spec 7.3.

import { describe, expect, it } from 'vitest';
import { createPallet, getSite } from './state';
import { quietWorld, runUntil, transitions } from './testkit';
import { spawnTruck } from './trucks';
import { step } from './world';

describe('truck', () => {
  it('inbound: en_route → at_gate → docking → unloading → departing, then leaves the map', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'inbound', 4);
    const shipmentId = truck.shipmentId;
    runUntil(w, () => !w.trucks.has(truck.id));
    expect(transitions(w, 'truck_state', truck.id)).toEqual(['at_gate', 'docking', 'unloading', 'departing']);
    const steps = w.log.events.filter((e) => e.type === 'shipment_step' && e.entityId === shipmentId);
    expect(steps.map((e) => e.payload?.step)).toEqual(['confirmed', 'picked', 'handling', 'in_transit', 'delivered']);
    expect(steps.map((e) => e.t)).toEqual([...steps.map((e) => e.t)].sort((a, b) => a - b));
    expect(w.log.events.at(-1)).toMatchObject({ type: 'truck_removed', entityId: truck.id });
  });

  it('outbound: en_route → at_gate → docking → loading → departing → in_transit → delivered', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 5);
    let maxCargo = 0;
    let siteWhileInTransit: string | null | undefined;
    runUntil(
      w,
      () => {
        const t = w.trucks.get(truck.id);
        maxCargo = Math.max(maxCargo, t?.cargo.pallets ?? 0);
        if (t?.state === 'in_transit') siteWhileInTransit = t.siteId;
        return !t;
      },
      4 * 3600,
    );
    expect(transitions(w, 'truck_state', truck.id)).toEqual([
      'at_gate', 'docking', 'loading', 'departing', 'in_transit', 'delivered',
    ]);
    expect(maxCargo).toBe(5);
    expect(siteWhileInTransit).toBeNull(); // off the map, not rendered (spec 7.2)
  });

  it('docks at 10–22 km/h (spec 7.3)', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'inbound', 1);
    runUntil(w, () => truck.state === 'docking');
    expect(truck.speedKmh).toBeGreaterThanOrEqual(10);
    expect(truck.speedKmh).toBeLessThanOrEqual(22);
  });

  it('queues at the gate until a matching dock is available', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01'); // one inbound dock
    const a = spawnTruck(w, site, 'inbound', 3);
    const b = spawnTruck(w, site, 'inbound', 3);
    runUntil(w, () => !w.trucks.has(a.id) && !w.trucks.has(b.id));
    const at = (id: string, to: string) =>
      w.log.events.find((e) => e.type === 'truck_state' && e.entityId === id && e.payload?.to === to)!.t;
    const [first, second] = [a, b].sort((x, y) => at(x.id, 'docking') - at(y.id, 'docking'));
    expect(at(second!.id, 'docking')).toBeGreaterThan(at(first!.id, 'departing'));
  });
});

describe('transfer between sites (spec 7.4)', () => {
  it('leaves A as an outbound truck, drives off-map, and reappears at B en route as an inbound truck', () => {
    const w = quietWorld(['WH-01', 'WH-02']);
    const a = getSite(w, 'WH-01');
    const truck = spawnTruck(w, a, 'outbound', 3, 'WH-02');
    const first = truck.shipmentId;
    expect(w.shipments.get(first)).toMatchObject({ destSiteId: 'WH-02', destination: 'WH-02 · Northgate DC' });

    let offMap = false;
    runUntil(w, () => {
      if (truck.state === 'in_transit') offMap ||= truck.siteId === null;
      return truck.homeSiteId === 'WH-02';
    });
    expect(offMap).toBe(true);
    expect(truck).toMatchObject({ siteId: 'WH-02', state: 'en_route', direction: 'inbound', destSiteId: undefined });
    expect(truck.shipmentId).not.toBe(first);
    expect(w.log.events.find((e) => e.type === 'truck_rehomed')).toMatchObject({ siteId: 'WH-02', entityId: truck.id, payload: { from: 'WH-01' } });

    // Highway time follows the distance table: 6 km at 60 km/h = 6 sim minutes.
    const at = (to: string) => w.log.events.find((e) => e.type === 'truck_state' && e.entityId === truck.id && e.payload?.to === to)!.t;
    expect(at('en_route') - at('in_transit')).toBeCloseTo(6 * 60, 0);

    // It carries only goods WH-02 stocks, and they end up in WH-02's stock.
    const carried = [...w.pallets.values()].filter((p) => p.location.ref === truck.id);
    expect(carried).toHaveLength(3);
    const stocked = new Set(getSite(w, 'WH-02').inventory.map((i) => i.sku));
    for (const p of carried) {
      expect(p.siteId).toBe('WH-02');
      expect(stocked.has(p.sku)).toBe(true);
    }
    const before = getSite(w, 'WH-02').today.putAways;
    runUntil(w, () => !w.trucks.has(truck.id));
    expect(getSite(w, 'WH-02').today.putAways).toBe(before + 3);
  });
});

describe('dock', () => {
  it('available → reserved → occupied → available', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01');
    const dock = site.docks.find((d) => d.direction === 'in')!;
    const truck = spawnTruck(w, site, 'inbound', 2);
    runUntil(w, () => truck.state === 'departing');
    expect(transitions(w, 'dock_state', `WH-01/${dock.id}`)).toEqual(['reserved', 'occupied', 'available']);
    expect(dock.truckId).toBeUndefined();
  });
});

describe('forklift', () => {
  const settle = (w: ReturnType<typeof quietWorld>) =>
    runUntil(w, () => [...w.forklifts.values()].every((f) => f.state === 'idle' && !f.motion));

  it('loading: idle → fetching → loading_truck → returning → idle', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 1);
    runUntil(w, () => truck.state === 'departing');
    settle(w);
    const seqs = ['FL-01', 'FL-02'].map((id) => transitions(w, 'forklift_state', id));
    expect(seqs).toContainEqual(['fetching', 'loading_truck', 'returning', 'idle']);
  });

  it('unloading: idle → fetching → unloading_truck → returning → idle', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'inbound', 1);
    runUntil(w, () => truck.state === 'departing');
    settle(w);
    const seqs = ['FL-01', 'FL-02'].map((id) => transitions(w, 'forklift_state', id));
    expect(seqs).toContainEqual(['fetching', 'unloading_truck', 'returning', 'idle']);
  });

  it('battery < 20% while idle → charging → idle at ≥ 95%', () => {
    const w = quietWorld();
    const fl = w.forklifts.get('FL-01')!;
    fl.battery = 15;
    step(w);
    expect(fl.state).toBe('charging');
    runUntil(w, () => fl.state === 'idle');
    expect(fl.battery).toBeGreaterThanOrEqual(95);
    expect(transitions(w, 'forklift_state', 'FL-01')).toEqual(['charging', 'idle']);
    const c1 = getSite(w, 'WH-01').chargers[0]!;
    expect(c1.sessionsToday).toBe(1);
    expect(c1.energyKwhToday).toBeGreaterThan(0);
  });

  it('queues when every charger is taken, then charges in turn', () => {
    const w = quietWorld();
    w.forklifts.get('FL-01')!.battery = 10;
    w.forklifts.get('FL-02')!.battery = 12;
    step(w);
    expect(w.forklifts.get('FL-02')!.state).toBe('queued_for_charger');
    runUntil(w, () => [...w.forklifts.values()].every((f) => f.state === 'idle'));
    expect(transitions(w, 'forklift_state', 'FL-02')).toEqual(['queued_for_charger', 'charging', 'idle']);
  });

  it('a busy forklift with a low battery finishes its move before charging', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 6);
    for (const f of w.forklifts.values()) f.battery = 26;
    runUntil(w, () => truck.state === 'departing');
    settle(w);
    for (const id of ['FL-01', 'FL-02']) {
      const seq = transitions(w, 'forklift_state', id);
      const firstCharge = seq.findIndex((s) => s === 'charging' || s === 'queued_for_charger');
      if (firstCharge > 0) expect(seq[firstCharge - 1]).toBe('idle');
    }
    expect(w.log.events.some((e) => e.type === 'battery_low')).toBe(true);
  });
});

describe('pallet', () => {
  it('outbound: staged → moving → loaded', () => {
    const w = quietWorld();
    const staged = w.pallets.get('PAL-1026')!;
    expect(staged.name).toBe('Safety Helmet');
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 3);
    runUntil(w, () => truck.state === 'departing');
    expect(transitions(w, 'pallet_state', staged.id)).toEqual(['moving', 'loaded']);
  });

  it('outbound from the racking once the yard is empty: in_rack → moving → loaded', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 5);
    runUntil(w, () => truck.state === 'departing');
    const fromRack = [...w.pallets.values()].filter((p) => p.location.ref === truck.id && Number(p.id.slice(4)) > 1026);
    expect(fromRack).toHaveLength(2);
    for (const p of fromRack) expect(transitions(w, 'pallet_state', p.id)).toEqual(['moving', 'loaded']);
  });

  it('inbound: loaded → moving → staged, or into the racking when the yard is full', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01');
    for (let i = 3; i < 7; i++) createPallet(w, 'WH-01', 'BOX-M', 'staged', { kind: 'slot', ref: `yard-${i}` });
    const before = site.inventory.reduce((s, i) => s + i.qty, 0);
    const truck = spawnTruck(w, site, 'inbound', 3);
    const cargo = [...w.pallets.values()].filter((p) => p.location.ref === truck.id).map((p) => p.id);
    runUntil(w, () => truck.state === 'departing');
    const ends = cargo.map((id) => transitions(w, 'pallet_state', id).join());
    expect(ends.filter((s) => s === 'moving,staged')).toHaveLength(1); // last free yard slot
    expect(ends.filter((s) => s === 'moving,in_rack')).toHaveLength(2);
    expect(site.inventory.reduce((s, i) => s + i.qty, 0)).toBe(before + 2);
  });

  it('emits low_stock once when a line crosses its threshold', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01');
    for (const p of [...w.pallets.values()]) w.pallets.delete(p.id); // empty yard: load from racking
    const tape = site.inventory.find((i) => i.sku === 'TAPE-48')!;
    for (const i of site.inventory) if (i !== tape) i.qty = 0;
    tape.qty = tape.lowStockThreshold;
    const truck = spawnTruck(w, site, 'outbound', 2);
    runUntil(w, () => truck.state === 'departing');
    expect(w.log.events.filter((e) => e.type === 'low_stock').map((e) => e.entityId)).toEqual(['TAPE-48']);
  });
});
