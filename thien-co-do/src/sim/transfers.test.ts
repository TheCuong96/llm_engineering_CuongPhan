import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../data/peaks';
import { distance } from './geometry';
import { chestsOnHand } from './selectors';
import { spawnShip } from './ships';
import { getPeak, sharedSkus } from './state';
import { quietWorld, runUntil, transitions } from './testkit';
import { createWorld, runFor } from './world';

describe('transfers between peaks (spec §7.4)', () => {
  it('PH-01 → PH-02: loads only shared SKUs, flies between peaks with peakId null, then lands as PH-02 inbound', () => {
    const w = quietWorld(['PH-01', 'PH-02']);
    const from = getPeak(w, 'PH-01');
    const to = getPeak(w, 'PH-02');
    const totalBefore = chestsOnHand(w, 'PH-01') + chestsOnHand(w, 'PH-02');
    const ship = spawnShip(w, from, 'outbound', 4, 'PH-02');
    const firstOrder = w.orders.get(ship.orderId)!;
    expect(firstOrder.destination).toBe('Đan Hà Phong');

    runUntil(w, () => ship.state === 'in_transit');
    expect(ship.peakId).toBeNull();
    const allowed = new Set(sharedSkus(from, to));
    const cargo = [...w.chests.values()].filter((c) => c.location.ref === ship.id);
    expect(cargo).toHaveLength(4);
    for (const c of cargo) expect(allowed.has(c.sku)).toBe(true);

    // the ship really travels toward the destination while between peaks
    const d0 = distance(ship.pos, to.geometry.approachFrom);
    runFor(w, 60);
    expect(distance(ship.pos, to.geometry.approachFrom)).toBeLessThan(d0);

    runUntil(w, () => ship.homePeakId === 'PH-02');
    expect(firstOrder.steps.at(-1)!.at).toBeDefined(); // outbound order delivered on arrival
    expect(ship).toMatchObject({ peakId: 'PH-02', direction: 'inbound', state: 'sailing' });
    expect(w.log.events.some((e) => e.type === 'ship_rehomed' && e.entityId === ship.id)).toBe(true);
    for (const c of cargo) expect(c.peakId).toBe('PH-02');

    runUntil(w, () => !w.ships.has(ship.id));
    expect(transitions(w, 'ship_state', ship.id)).toEqual([
      'at_barrier', 'landing', 'loading', 'departing', 'in_transit',
      'sailing', 'at_barrier', 'landing', 'unloading', 'departing', 'in_transit', 'delivered',
    ]);
    // chests moved, none created or lost across the sect
    expect(chestsOnHand(w, 'PH-01') + chestsOnHand(w, 'PH-02')).toBe(totalBefore);
    expect(chestsOnHand(w, 'PH-02')).toBe(to.kpiBaseline.chestsOnHand + 4);
  });

  it('happen on their own across a 60-minute run with all five peaks', () => {
    const w = createWorld(defaultConfig(20261023));
    runFor(w, 60 * 60);
    const rehomed = w.log.events.filter((e) => e.type === 'ship_rehomed');
    expect(rehomed.length).toBeGreaterThan(0);
    for (const e of rehomed) expect(e.payload?.from).not.toBe(e.payload?.to);
  });
});
