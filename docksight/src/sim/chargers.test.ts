import { describe, expect, it } from 'vitest';
import { pickCharger } from './chargers';
import type { Charger, Forklift } from './types';

const charger = (id: string, x: number, extra: Partial<Charger> = {}): Charger => ({
  id,
  label: id,
  ratePctPerMin: 2.5,
  queue: [],
  sessionsToday: 0,
  energyKwhToday: 0,
  pos: [x, 0, 0],
  ...extra,
});

const fl = { id: 'FL-99', pos: [0, 0, 0] } as unknown as Forklift;

describe('pickCharger', () => {
  it('takes the nearest free charger', () => {
    const c = [charger('C1', 30), charger('C2', 10, { forkliftId: 'FL-01' }), charger('C3', 20)];
    expect(pickCharger(fl, c)).toEqual({ charger: c[2], queue: false });
  });

  it('queues when every charger is busy, at the shortest queue', () => {
    const c = [
      charger('C1', 5, { forkliftId: 'FL-01', queue: ['FL-03', 'FL-04'] }),
      charger('C2', 50, { forkliftId: 'FL-02', queue: [] }),
    ];
    expect(pickCharger(fl, c)).toEqual({ charger: c[1], queue: true });
  });

  it('returns undefined for a site without chargers', () => {
    expect(pickCharger(fl, [])).toBeUndefined();
  });
});
