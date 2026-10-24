// One test per transition family of spec §7.3.

import { describe, expect, it } from 'vitest';
import { createRng } from './rng';
import { gateWaitSec, spawnShip } from './ships';
import { createChest, getPeak } from './state';
import { quietWorld, runUntil, transitions } from './testkit';
import { step } from './world';

describe('spirit ship', () => {
  it('inbound: sailing → at_barrier → landing → unloading → departing → in_transit → delivered', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 4);
    runUntil(w, () => !w.ships.has(ship.id));
    expect(transitions(w, 'ship_state', ship.id)).toEqual([
      'at_barrier', 'landing', 'unloading', 'departing', 'in_transit', 'delivered',
    ]);
    const steps = w.log.events.filter((e) => e.type === 'order_step' && e.entityId === ship.orderId);
    expect(steps.map((e) => e.payload?.step)).toEqual(['accepted', 'inspected', 'handling', 'in_flight', 'delivered']);
    expect(steps.map((e) => e.t)).toEqual([...steps.map((e) => e.t)].sort((a, b) => a - b));
  });

  it('outbound: sailing → at_barrier → landing → loading → departing → in_transit → delivered', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 5);
    let maxCargo = 0;
    runUntil(w, () => {
      maxCargo = Math.max(maxCargo, w.ships.get(ship.id)?.cargo.chests ?? 0);
      return !w.ships.has(ship.id);
    });
    expect(transitions(w, 'ship_state', ship.id)).toEqual([
      'at_barrier', 'landing', 'loading', 'departing', 'in_transit', 'delivered',
    ]);
    expect(maxCargo).toBe(5);
  });

  it('waits at the barrier until a matching pad is free', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01'); // one inbound pad
    const a = spawnShip(w, peak, 'inbound', 3);
    const b = spawnShip(w, peak, 'inbound', 3);
    runUntil(w, () => !w.ships.has(a.id) && !w.ships.has(b.id));
    const at = (id: string, to: string) =>
      w.log.events.find((e) => e.type === 'ship_state' && e.entityId === id && e.payload?.to === to)!.t;
    // Whichever reaches the gate first takes the pad; the other must wait for it to leave.
    const [first, second] = [a, b].sort((x, y) => at(x.id, 'landing') - at(y.id, 'landing'));
    expect(at(second!.id, 'landing')).toBeGreaterThan(at(first!.id, 'departing'));
    expect(at(second!.id, 'landing') - at(second!.id, 'at_barrier')).toBeGreaterThan(360);
  });
});

describe('spirit ship pad', () => {
  it('free → reserved → occupied → free', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01');
    const pad = peak.pads.find((p) => p.direction === 'in')!;
    const ship = spawnShip(w, peak, 'inbound', 2);
    runUntil(w, () => ship.state === 'in_transit');
    expect(transitions(w, 'pad_state', `PH-01/${pad.id}`)).toEqual(['reserved', 'occupied', 'free']);
    expect(pad.state).toBe('free');
  });
});

describe('disciple / puppet', () => {
  it('loading: idle → fetching → loading_ship → returning → idle', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 1);
    runUntil(w, () => ship.state === 'departing');
    runUntil(w, () => [...w.workers.values()].every((x) => x.state === 'idle' && !x.motion));
    const seqs = ['DT-07', 'DT-03'].map((id) => transitions(w, 'worker_state', id));
    expect(seqs).toContainEqual(['fetching', 'loading_ship', 'returning', 'idle']);
  });

  it('unloading: idle → fetching → unloading_ship → returning → idle', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 1);
    runUntil(w, () => ship.state === 'departing');
    runUntil(w, () => [...w.workers.values()].every((x) => x.state === 'idle' && !x.motion));
    const seqs = ['DT-07', 'DT-03'].map((id) => transitions(w, 'worker_state', id));
    expect(seqs).toContainEqual(['fetching', 'unloading_ship', 'returning', 'idle']);
  });

  it('qi < 20 while idle → restoring at a free array → idle at ≥ 95', () => {
    const w = quietWorld();
    const dt = w.workers.get('DT-07')!;
    dt.qi = 15;
    step(w);
    expect(dt.state).toBe('restoring');
    runUntil(w, () => dt.state === 'idle');
    expect(dt.qi).toBeGreaterThanOrEqual(95);
    expect(transitions(w, 'worker_state', 'DT-07')).toEqual(['restoring', 'idle']);
    expect(getPeak(w, 'PH-01').arrays[0]!.sessionsToday).toBe(1);
  });

  it('queues when every array is taken, then restores in turn', () => {
    const w = quietWorld();
    w.workers.get('DT-07')!.qi = 10;
    w.workers.get('DT-03')!.qi = 12;
    step(w);
    expect(w.workers.get('DT-03')!.state).toBe('queued_for_array');
    runUntil(w, () => [...w.workers.values()].every((x) => x.state === 'idle'));
    expect(transitions(w, 'worker_state', 'DT-03')).toEqual(['queued_for_array', 'restoring', 'idle']);
  });

  it('a busy worker with low qi finishes its move before resting', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 8);
    for (const x of w.workers.values()) x.qi = 30;
    runUntil(w, () => !w.ships.has(ship.id));
    for (const id of ['DT-07', 'DT-03']) {
      const seq = transitions(w, 'worker_state', id);
      const firstRest = seq.indexOf('restoring');
      if (firstRest > 0) expect(['idle', 'queued_for_array']).toContain(seq[firstRest - 1]);
    }
  });

  it('puppets restore twice as fast and use the same machine', () => {
    const w = quietWorld(['PH-01', 'PH-05']);
    const gainOf = (id: string) => {
      const x = w.workers.get(id)!;
      const array = getPeak(w, x.peakId).arrays[0]!;
      x.state = 'restoring';
      x.arrayId = array.id;
      array.occupantId = x.id;
      x.pos = array.pos;
      x.qi = 50;
      return x;
    };
    const disciple = gainOf('DT-07');
    const puppet = gainOf('KL-15');
    step(w);
    expect(puppet.qi - 50).toBeCloseTo(2 * (disciple.qi - 50), 9);
  });
});

describe('chest', () => {
  it('outbound: staged → carried → loaded', () => {
    const w = quietWorld();
    const staged = [...w.chests.values()].find((c) => c.state === 'staged')!;
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 1);
    runUntil(w, () => ship.state === 'departing');
    expect(transitions(w, 'chest_state', staged.id)).toEqual(['carried', 'loaded']);
  });

  it('outbound from the vault once the yard is empty: in_vault → carried → loaded', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 5);
    runUntil(w, () => ship.state === 'departing');
    const fromVault = [...w.chests.values()].filter((c) => c.location.ref === ship.id && c.id > 'R-1026');
    expect(fromVault.length).toBe(2);
    for (const c of fromVault) expect(transitions(w, 'chest_state', c.id)).toEqual(['carried', 'loaded']);
  });

  it('inbound: loaded → carried → staged, or into the vault when the yard is full', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01');
    for (let i = 3; i < 11; i++) createChest(w, 'PH-01', 'blood_lingzhi', 'staged', { kind: 'slot', ref: `yard-${i}` });
    const before = peak.inventory.reduce((s, i) => s + i.qty, 0);
    const ship = spawnShip(w, peak, 'inbound', 3);
    const cargo = [...w.chests.values()].filter((c) => c.location.ref === ship.id).map((c) => c.id);
    runUntil(w, () => ship.state === 'departing');
    const ends = cargo.map((id) => transitions(w, 'chest_state', id));
    expect(ends.filter((s) => s.join() === 'carried,staged')).toHaveLength(1); // last free slot
    expect(ends.filter((s) => s.join() === 'carried,in_vault')).toHaveLength(2);
    expect(peak.inventory.reduce((s, i) => s + i.qty, 0)).toBe(before + 2);
  });
});

describe('Hộ Sơn Đại Trận', () => {
  it('costs 2 per gate opening and regenerates 1 per sim minute', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01');
    const ship = spawnShip(w, peak, 'inbound', 1);
    runUntil(w, () => ship.state === 'landing');
    expect(peak.barrier.strength).toBeCloseTo(98, 5);
    const s0 = peak.barrier.strength;
    const t0 = w.t;
    runUntil(w, () => w.t >= t0 + 60, 61);
    expect(peak.barrier.strength).toBeCloseTo(s0 + 1, 5);
  });

  it('goes weak below 60%, recovers above, and doubles the gate wait while weak', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01');
    peak.barrier.strength = 59.99;
    step(w);
    runUntil(w, () => !peak.barrier.weak, 120);
    const types = w.log.events.filter((e) => e.entityId === 'PH-01').map((e) => e.type);
    expect(types).toEqual(['barrier_weak', 'barrier_recovered']);

    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const normal = gateWaitSec(rng, false);
      const weak = gateWaitSec(rng, true);
      expect(normal).toBeGreaterThanOrEqual(120);
      expect(normal).toBeLessThanOrEqual(360);
      expect(weak).toBeGreaterThanOrEqual(240);
      expect(weak).toBeLessThanOrEqual(720);
    }
  });
});

describe('hàn khí (cold chain)', () => {
  it('warns once at 70% of the allowed time outside Hàn Băng Cốc', () => {
    const w = quietWorld(['PH-01', 'PH-03']);
    const outside = createChest(w, 'PH-01', 'snow_lotus', 'staged', { kind: 'slot', ref: 'yard-5' });
    const inside = createChest(w, 'PH-03', 'snow_lotus', 'staged', { kind: 'slot', ref: 'yard-5' });
    runUntil(w, () => outside.needsCold!.warned, 3600);
    expect(outside.needsCold!.minutesOutside).toBeCloseTo(45 * 0.7, 1);
    expect(inside.needsCold!.minutesOutside).toBe(0);
    expect(w.log.events.filter((e) => e.type === 'cold_warning').map((e) => e.entityId)).toEqual([outside.id]);
    expect(w.chests.has(outside.id)).toBe(true); // warning only, never destroyed
  });
});
