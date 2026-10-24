// Strings, chips and bars of the five card variants against spec 4.4 / 4.6.

import { describe, expect, it } from 'vitest';
import { getSite } from '../sim/state';
import { quietWorld, runUntil } from '../sim/testkit';
import { spawnTruck } from '../sim/trucks';
import type { Truck } from '../sim/types';
import { cardFor, chargerChip, forkliftChip, truckChip } from './viewModels';

describe('site card (spec 4.4 "Site")', () => {
  it('WH-01 at start', () => {
    const w = quietWorld();
    const c = cardFor(w, { kind: 'site', id: 'WH-01' })!;
    expect(c).toMatchObject({ eyebrow: 'Depot · WH-01', title: 'Riverside Hub', chip: { tone: 'success', text: 'Operational' } });
    expect(c.site!.summary).toBe('0 docked · 0 arriving · 3 staged');
    expect(c.site!.stock.value).toBe('1,412 / 1,800');
    expect(c.site!.bays.value).toBe('0 / 2 busy');
    expect(c.site!.outboundToday).toBe('23');
    expect(c.site!.putAwaysToday).toBe('15');
    expect(c.site!.inventory.map((i) => [i.name, i.low])).toEqual([
      ['Cardboard Box (M)', false],
      ['Plastic Container', false],
      ['Safety Helmet', false],
      ['Packing Tape', true],
    ]);
    expect(c.site!.fleet.value).toBe('0/2 working');
    expect(c.site!.fleet.rows.map((r) => r.caption)).toEqual(['82%', '46%']);
  });
});

describe('truck card (spec 4.4 "Truck")', () => {
  it('follows the truck through docking and loading', () => {
    const w = quietWorld();
    const t = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 3);
    const first = cardFor(w, { kind: 'truck', id: t.id })!;
    expect(first.title).toBe(t.id);
    expect(first.eyebrow).toBe(w.carriers.find((c) => c.id === t.carrierId)!.name);
    expect(first.subtitle).toBe(`${t.driver} · ${t.plate}`);
    expect(first.progress!.caption).toMatch(/^\d[\d,]* m left$/);
    expect(first.fields.map((f) => f.label)).toEqual(['Shipment', 'Customer', 'Destination', 'ETA', 'Speed', 'Bay', 'Cargo']);
    expect(first.fields[0]!.value).toMatch(/^#SHP-\d+$/);
    expect(first.fields[3]!.value).toMatch(/^\d\d:\d\d$/);

    runUntil(w, () => t.state === 'docking');
    expect(cardFor(w, { kind: 'truck', id: t.id })!.desc).toBe('Reversing into Bay 1');
    runUntil(w, () => t.state === 'loading' && t.cargo.pallets === 2);
    const loading = cardFor(w, { kind: 'truck', id: t.id })!;
    expect(loading.progress!.caption).toBe('2/6 pallets');
    expect(loading.fields.find((f) => f.label === 'Cargo')!.value).toMatch(/^2\/6 pallets · \d+\.\d t$/);
    expect(loading.fields.find((f) => f.label === 'Bay')!.value).toBe('Bay 1');
  });

  it('keeps a "left …" line once the truck is on the highway', () => {
    const w = quietWorld();
    const t = spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 1);
    runUntil(w, () => t.state === 'in_transit');
    expect(cardFor(w, { kind: 'truck', id: t.id })!.departed).toMatch(/^Left WH-01 · heading to /);
  });
});

describe('chip colours (spec 4.6)', () => {
  const truck = (state: Truck['state']) => truckChip({ state } as Truck);
  it.each([
    ['loading', 'success', 'Loading'],
    ['unloading', 'success', 'Unloading'],
    ['at_gate', 'warning', 'At gate'],
    ['en_route', 'info', 'En route'],
    ['docking', 'info', 'Docking'],
    ['delivered', 'neutral', 'Delivered'],
  ] as const)('truck %s → %s "%s"', (state, tone, text) => {
    expect(truck(state)).toEqual({ tone, text });
  });
  it('forklift and charger chips', () => {
    expect(forkliftChip({ state: 'charging' } as never)).toEqual({ tone: 'warning', text: 'Charging' });
    expect(forkliftChip({ state: 'loading_truck' } as never)).toEqual({ tone: 'success', text: 'Loading truck' });
    expect(forkliftChip({ state: 'unloading_truck' } as never)).toEqual({ tone: 'success', text: 'Unloading truck' });
    expect(chargerChip({ forkliftId: undefined } as never)).toEqual({ tone: 'success', text: 'Free' });
    expect(chargerChip({ forkliftId: 'FL-02' } as never)).toEqual({ tone: 'warning', text: 'Charging FL-02' });
  });
});

describe('forklift, pallet and charger cards', () => {
  it('forklift FL-01', () => {
    const w = quietWorld();
    const c = cardFor(w, { kind: 'forklift', id: 'FL-01' })!;
    expect(c).toMatchObject({ eyebrow: 'Forklift · WH-01', title: 'FL-01', subtitle: 'Sam Haddad · Kestrel EF-18' });
    expect(c.progress).toMatchObject({ caption: '82%', label: 'Battery' });
    expect(c.fields.map((f) => [f.label, f.value])).toEqual([
      ['Carrying', 'Empty'],
      ['Moves today', '0'],
      ['Speed', '0.0 km/h'],
      ['Charger', 'C1'],
      ['Site', 'WH-01 · Riverside Hub'],
    ]);
  });

  it('pallet PAL-1026 staged, then moving on the forks', () => {
    const w = quietWorld();
    const c = cardFor(w, { kind: 'pallet', id: 'PAL-1026' })!;
    expect(c).toMatchObject({ eyebrow: 'Pallet · PPE', title: 'Safety Helmet', subtitle: 'PAL-1026 · PPE-HLM', chip: { text: 'Staged' } });
    expect(c.fields.find((f) => f.label === 'Location')!.value).toBe('Yard slot 3');
    spawnTruck(w, getSite(w, 'WH-01'), 'outbound', 3);
    runUntil(w, () => w.pallets.get('PAL-1026')!.state === 'moving');
    const moving = cardFor(w, { kind: 'pallet', id: 'PAL-1026' })!;
    expect(moving.chip).toEqual({ tone: 'info', text: 'Moving' });
    expect(moving.fields.find((f) => f.label === 'Location')!.value).toMatch(/^On forks of FL-0[12]$/);
  });

  it('charger C1', () => {
    const w = quietWorld();
    const c = cardFor(w, { kind: 'charger', id: 'WH-01/C1' })!;
    expect(c).toMatchObject({ eyebrow: 'Charger · WH-01', title: 'C1', subtitle: '48 V lithium-ion forklift charger', chip: { text: 'Free' } });
    expect(c.fields.map((f) => f.label)).toEqual(['Sessions today', 'Energy today', 'Charge rate', 'Queue', 'Site']);
  });

  it('returns null for an entity that no longer exists', () => {
    const w = quietWorld();
    expect(cardFor(w, { kind: 'truck', id: 'TRK-0000' })).toBeNull();
  });
});
