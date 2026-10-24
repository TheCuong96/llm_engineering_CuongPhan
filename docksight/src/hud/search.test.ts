import { describe, expect, it } from 'vitest';
import { getSite } from '../sim/state';
import { quietWorld } from '../sim/testkit';
import { spawnTruck } from '../sim/trucks';
import { MAX_PER_GROUP, searchWorld } from './search';

describe('searchWorld (spec 4.7)', () => {
  const world = () => {
    const w = quietWorld();
    for (let i = 0; i < 7; i++) spawnTruck(w, getSite(w, 'WH-01'), 'inbound', 1);
    return w;
  };

  it('finds by id prefix, case-insensitive, grouped and capped at 5 per kind', () => {
    const hits = searchWorld(world(), 'trk', 'WH-01');
    const trucks = hits.filter((h) => h.kind === 'truck');
    expect(trucks.length).toBe(MAX_PER_GROUP); // 7 trucks exist
    expect(hits[0]!.kind).toBe('truck'); // trucks before the shipments that mention them
    expect(hits.filter((h) => h.kind === 'shipment').length).toBeLessThanOrEqual(MAX_PER_GROUP);
  });

  it('finds pallets by id and by name', () => {
    const w = world();
    expect(searchWorld(w, 'PAL-1026', 'WH-01')[0]).toMatchObject({ kind: 'pallet', id: 'PAL-1026' });
    expect(searchWorld(w, 'helmet', 'WH-01').map((h) => h.id)).toContain('PAL-1026');
  });

  it('matches fuzzily on ids ("fl1" → FL-01, "pal26" → PAL-1026)', () => {
    const w = world();
    expect(searchWorld(w, 'fl1', 'WH-01')[0]).toMatchObject({ id: 'FL-01' });
    expect(searchWorld(w, 'pal26', 'WH-01').map((h) => h.id)).toContain('PAL-1026');
  });

  it('a shipment hit selects its truck; groups follow the site → shipment order', () => {
    const w = world();
    const t = [...w.trucks.values()][0]!;
    const hit = searchWorld(w, t.shipmentId, 'WH-01').find((h) => h.kind === 'shipment')!;
    expect(hit.target).toEqual({ kind: 'truck', id: t.id });
    const kinds = searchWorld(w, 'wh-01', 'WH-01').map((h) => h.kind);
    expect(kinds[0]).toBe('site');
  });

  it('returns nothing for a blank query', () => {
    expect(searchWorld(world(), '   ', 'WH-01')).toEqual([]);
  });
});
