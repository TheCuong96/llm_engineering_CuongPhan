import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../data/peaks';
import { createWorld, runFor } from '../sim/world';
import { normalizeVi, searchWorld } from './search';

describe('normalizeVi', () => {
  it('strips diacritics and handles đ/Đ, which NFD does not decompose', () => {
    expect(normalizeVi('Huyết Linh Chi')).toBe('huyet linh chi');
    expect(normalizeVi('Đan Hà Phong')).toBe('dan ha phong');
    expect(normalizeVi('Truyền Tống Đài')).toBe('truyen tong dai');
    expect(normalizeVi('Đ ữ ỡ ặ ỷ')).toBe('d u o a y');
    expect('Đ'.normalize('NFD')).toBe('Đ'); // the reason for the special case
  });
});

describe('searchWorld', () => {
  const world = createWorld(defaultConfig());
  runFor(world, 600);

  it('"tu van" finds Tử Vân Phong (P4 criterion)', () => {
    const hits = searchWorld(world, 'tu van', 'PH-01');
    expect(hits[0]).toMatchObject({ kind: 'peak', id: 'PH-01', title: 'Tử Vân Phong' });
  });

  it('"huyet linh chi" finds Huyết Linh Chi chests, viewed peak first', () => {
    const hits = searchWorld(world, 'huyet linh chi', 'PH-01').filter((h) => h.kind === 'chest');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.title).toContain('Huyết Linh Chi');
    expect(hits[0]!.peakId).toBe('PH-01');
  });

  it('"dan ha" matches the đ in Đan Hà Phong', () => {
    expect(searchWorld(world, 'dan ha', 'PH-01').map((h) => h.id)).toContain('PH-02');
  });

  it('matches id prefixes for every kind and caps each group at 5', () => {
    expect(searchWorld(world, 'PH-0', 'PH-03').filter((h) => h.kind === 'peak')).toHaveLength(5);
    expect(searchWorld(world, 'PH-0', 'PH-03')[0]!.id).toBe('PH-03'); // viewed peak first
    expect(searchWorld(world, 'dt-07', 'PH-01')[0]).toMatchObject({ kind: 'worker', id: 'DT-07' });
    expect(searchWorld(world, 'kl-15', 'PH-01')[0]).toMatchObject({ kind: 'worker', id: 'KL-15' });
    const ship = [...world.ships.values()][0]!;
    expect(searchWorld(world, ship.id.toLowerCase(), 'PH-01')[0]).toMatchObject({ kind: 'ship', id: ship.id });
    const order = searchWorld(world, ship.orderId.replace('#', ''), 'PH-01').find((h) => h.kind === 'order');
    expect(order?.target).toEqual({ kind: 'ship', id: ship.id });
    const groups = new Map<string, number>();
    for (const h of searchWorld(world, 'r-', 'PH-01')) groups.set(h.kind, (groups.get(h.kind) ?? 0) + 1);
    for (const n of groups.values()) expect(n).toBeLessThanOrEqual(5);
  });

  it('returns nothing for blank queries', () => {
    expect(searchWorld(world, '   ', 'PH-01')).toEqual([]);
  });
});
