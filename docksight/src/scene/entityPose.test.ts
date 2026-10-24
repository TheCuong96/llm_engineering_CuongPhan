import { describe, expect, it } from 'vitest';
import { TICK_DT } from '../sim/clock';
import { distance, motionPos } from '../sim/geometry';
import { getSite } from '../sim/state';
import { quietWorld, runUntil } from '../sim/testkit';
import { spawnTruck } from '../sim/trucks';
import { step } from '../sim/world';
import { BAY_HEADING, forkliftPose, FORKS, lerpAngle, palletPlacement, rotateY, truckPose } from './entityPose';

describe('truckPose', () => {
  it('interpolates between ticks on the engine motion', () => {
    const w = quietWorld();
    const truck = spawnTruck(w, getSite(w, 'WH-01'), 'inbound', 2);
    step(w);
    const a = truckPose(truck, w.t).pos;
    step(w);
    const b = truckPose(truck, w.t).pos;
    const mid = truckPose(truck, w.t - TICK_DT / 2).pos;
    expect(distance(mid, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])).toBeLessThan(1e-9);
    expect(mid).toEqual(motionPos(truck.motion!, w.t - TICK_DT / 2));
  });

  it('faces its direction of travel en route, and reverses into the bay while docking', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01');
    const truck = spawnTruck(w, site, 'inbound', 2);
    step(w);
    const enRoute = truckPose(truck, w.t);
    expect(enRoute.moving).toBe(true);
    expect(Math.sin(enRoute.heading!)).toBeGreaterThan(0.9); // road runs +x toward the gate

    runUntil(w, () => truck.state === 'docking');
    const m = truck.motion!;
    const toDock = Math.atan2(m.to[0] - m.from[0], m.to[2] - m.from[2]);
    const start = truckPose(truck, m.start).heading!;
    expect(Math.cos(start - toDock)).toBeCloseTo(-1, 6); // backing up: nose opposite to travel
    const end = truckPose(truck, m.start + m.duration).heading!;
    expect(Math.cos(end - BAY_HEADING)).toBeCloseTo(1, 6); // squared up with the bay lines
    runUntil(w, () => truck.state === 'unloading');
    expect(truckPose(truck, w.t)).toMatchObject({ heading: BAY_HEADING, moving: false });
  });

  it('lerpAngle takes the short way round', () => {
    expect(lerpAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.5)).toBeCloseTo(Math.PI, 9);
  });
});

describe('forkliftPose and pallets on forks', () => {
  it('lines idle forklifts up apart and puts a carried pallet on the forks', () => {
    const w = quietWorld();
    const [a, b] = [...w.forklifts.values()];
    expect(distance(forkliftPose(a!, w.t, 0).pos, forkliftPose(b!, w.t, 1).pos)).toBeGreaterThan(1.5);

    const site = getSite(w, 'WH-01');
    const truck = spawnTruck(w, site, 'outbound', 1);
    runUntil(w, () => [...w.forklifts.values()].some((f) => f.state === 'loading_truck'));
    const fl = [...w.forklifts.values()].find((f) => f.state === 'loading_truck')!;
    const pallet = w.pallets.get(fl.carrying!)!;
    const pose = { pos: fl.pos, heading: 0.7 };
    const at = palletPlacement(site, pallet, new Map([[fl.id, pose]]))!;
    const expected = rotateY(FORKS, 0.7);
    expect(at.pos).toEqual([fl.pos[0] + expected[0], fl.pos[1] + expected[1], fl.pos[2] + expected[2]]);
    expect(truck.state).toBe('loading');
  });

  it('draws nothing for pallets inside a trailer', () => {
    const w = quietWorld();
    const site = getSite(w, 'WH-01');
    const truck = spawnTruck(w, site, 'inbound', 2);
    const onBoard = [...w.pallets.values()].find((p) => p.location.ref === truck.id)!;
    expect(palletPlacement(site, onBoard, new Map())).toBeNull();
  });
});
