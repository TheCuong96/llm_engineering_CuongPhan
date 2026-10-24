import { describe, expect, it } from 'vitest';
import { TICK_DT } from '../sim/clock';
import { distance, motionPos } from '../sim/geometry';
import { spawnShip } from '../sim/ships';
import { getPeak } from '../sim/state';
import { quietWorld, runUntil } from '../sim/testkit';
import { step } from '../sim/world';
import { chestPlacement, chestVariant, deckSlot, headingOf, isImportant, rotateY, shipPose, SHOULDER, workerPose } from './entityPose';

describe('render poses follow engine state', () => {
  it('interpolates a moving ship between ticks and lands on the motion end exactly', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 2);
    step(w);
    const half = shipPose(ship, w.t + TICK_DT / 2);
    expect(half.moving).toBe(true);
    expect(distance(half.pos, motionPos(ship.motion!, w.t + TICK_DT / 2))).toBeLessThan(1e-9);
    step(w);
    // the half-tick pose lies between the two tick poses
    const prev = motionPos(ship.motion!, w.t - TICK_DT);
    expect(distance(prev, half.pos) + distance(half.pos, ship.pos)).toBeCloseTo(distance(prev, ship.pos), 9);
    expect(half.heading).toBeCloseTo(headingOf(ship.motion!.from, ship.motion!.to)!, 12);
  });

  it('puts a carried chest on the carrier shoulder and loaded chests on the deck', () => {
    const w = quietWorld();
    const peak = getPeak(w, 'PH-01');
    const ship = spawnShip(w, peak, 'outbound', 2);
    runUntil(w, () => [...w.chests.values()].some((c) => c.state === 'carried'));
    const carried = [...w.chests.values()].find((c) => c.state === 'carried')!;
    const carrier = w.workers.get(carried.location.ref)!;
    const wp = workerPose(carrier, w.t, 0);
    const placed = chestPlacement(w, peak, carried, new Map([[carrier.id, { pos: wp.pos, heading: 0 }]]), new Map(), 0)!;
    expect(placed.pos).toEqual([wp.pos[0] + SHOULDER[0], wp.pos[1] + SHOULDER[1], wp.pos[2] + SHOULDER[2]]);

    runUntil(w, () => ship.state === 'departing');
    const loaded = [...w.chests.values()].find((c) => c.location.kind === 'ship')!;
    const sp = { pos: ship.pos, heading: 1.2 };
    const onDeck = chestPlacement(w, peak, loaded, new Map(), new Map([[ship.id, sp]]), 3)!;
    const expected = rotateY(deckSlot(3), 1.2);
    expect(onDeck.pos[0] - ship.pos[0]).toBeCloseTo(expected[0], 9);
    expect(onDeck.pos[2] - ship.pos[2]).toBeCloseTo(expected[2], 9);
  });

  it('fans idle workers out around the shared home point', () => {
    const w = quietWorld();
    const [a, b] = [...w.workers.values()];
    expect(distance(workerPose(a!, w.t, 0).pos, workerPose(b!, w.t, 1).pos)).toBeGreaterThan(1);
  });

  it('picks chest variants and talisman markers', () => {
    const w = quietWorld(['PH-01', 'PH-03']);
    const byName = (sku: string) => [...w.chests.values()].find((c) => c.sku === sku)!;
    expect(chestVariant(byName('snow_lotus'))).toBe('frost');
    expect(chestVariant(byName('blood_lingzhi'))).toBe('jade');
    expect(chestVariant(byName('spirit_stone_low'))).toBe('wood');
    expect(isImportant(byName('snow_lotus'))).toBe(true);
    expect(isImportant(byName('spirit_stone_low'))).toBe(false);
  });

  it('deck holds a full cargo of 8 without overlap', () => {
    const slots = Array.from({ length: 8 }, (_, i) => deckSlot(i));
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) expect(distance(slots[i]!, slots[j]!)).toBeGreaterThan(0.9);
  });
});
