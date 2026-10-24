import { describe, expect, it } from 'vitest';
import { orderDoneAt, orderTimeline, peakSummary, shipProgress } from './hudSelectors';
import { spawnShip } from './ships';
import { getPeak } from './state';
import { quietWorld, runUntil } from './testkit';

describe('peakSummary', () => {
  it('counts landed / incoming ships and waiting chests', () => {
    const w = quietWorld();
    expect(peakSummary(w, 'PH-01')).toMatchObject({ landed: 0, incoming: 0, waiting: 3, busyPads: 0, totalPads: 2, workersTotal: 2 });
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 2);
    expect(peakSummary(w, 'PH-01').incoming).toBe(1);
    runUntil(w, () => ship.state === 'unloading');
    expect(peakSummary(w, 'PH-01')).toMatchObject({ landed: 1, incoming: 0, busyPads: 1 });
  });
});

describe('shipProgress', () => {
  it('reports remaining distance while sailing and n/target while handling', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 4);
    const p0 = shipProgress(w, ship);
    expect(p0?.kind).toBe('distance');
    runUntil(w, () => ship.state === 'loading' && ship.cargo.chests >= 2);
    expect(shipProgress(w, ship)).toEqual({ kind: 'chests', done: ship.cargo.chests, target: 4 });
  });
});

describe('orderTimeline', () => {
  it('keeps estimates monotonic and in the future, and real times once steps happen', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 3);
    const order = w.orders.get(ship.orderId)!;
    const check = () => {
      const steps = orderTimeline(w, order);
      const times = steps.map((s) => s.at ?? s.eta);
      for (const x of times) expect(x).toBeDefined();
      for (let i = 1; i < times.length; i++) expect(times[i]!).toBeGreaterThanOrEqual(times[i - 1]! - 1e-6);
      for (const s of steps) if (s.at === undefined) expect(s.eta!).toBeGreaterThanOrEqual(w.t - 1e-6);
    };
    check();
    for (const state of ['at_barrier', 'landing', 'loading', 'departing', 'in_transit'] as const) {
      runUntil(w, () => ship.state === state);
      check();
    }
  });

  it('first estimate of completion is within a few minutes of what actually happens', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 4);
    const order = w.orders.get(ship.orderId)!;
    const estimate = orderDoneAt(w, order);
    runUntil(w, () => order.steps.at(-1)!.at !== undefined);
    expect(Math.abs(order.steps.at(-1)!.at! - estimate)).toBeLessThan(4 * 60);
  });
});
