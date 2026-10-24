import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultConfig, sitePresets } from '../data/sites';
import { dockedCount, fillPct, onTimePct, siteKpis, stockOnHand } from './selectors';
import { createWorld, runFor, step, type World } from './world';

describe('initial KPIs match spec 7.1', () => {
  const world = createWorld(defaultConfig());
  it.each(sitePresets.map((p) => [p.id, p] as const))('%s', (id, preset) => {
    expect(stockOnHand(world, id)).toBe(preset.kpiBaseline.stockOnHand);
    expect(onTimePct(world, id)).toBeCloseTo(preset.kpiBaseline.onTimePct30d, 9);
    expect(dockedCount(world, id).total).toBe(preset.docks.length);
    expect(siteKpis(world, id).stockOnHand.delta).toBe(0);
  });
  it('WH-01 is 78% full', () => {
    expect(Math.round(fillPct(world, 'WH-01'))).toBe(78);
  });
});

describe('determinism', () => {
  const run = (seed: number) => {
    const w = createWorld(defaultConfig(seed));
    runFor(w, 30 * 60);
    return JSON.stringify(w.log.events);
  };
  it('same seed → identical event log', () => {
    const a = run(7);
    expect(a.length).toBeGreaterThan(1000);
    expect(run(7)).toBe(a);
  });
  it('different seed → different event log', () => {
    expect(run(8)).not.toBe(run(7));
  });
});

function checkInvariants(w: World) {
  for (const site of w.sites) {
    const preset = sitePresets.find((p) => p.id === site.id)!;
    // Conservation: stock only changes through put-aways (in) and outbound loading (out).
    const expected =
      preset.kpiBaseline.stockOnHand +
      (site.today.putAways - preset.today.putAways) -
      (site.today.outbound - preset.today.outbound);
    expect(stockOnHand(w, site.id), `${site.id} stock at t=${w.t}`).toBe(expected);

    for (const dock of site.docks) {
      if (dock.state === 'available') expect(dock.truckId).toBeUndefined();
      else expect(w.trucks.get(dock.truckId!)?.dockId, `${site.id}/${dock.id}`).toBe(dock.id);
    }
    for (const c of site.chargers) {
      if (c.forkliftId) expect(w.forklifts.get(c.forkliftId)?.chargerId).toBe(c.id);
    }
  }
  for (const t of w.trucks.values()) {
    if (t.dockId) {
      const dock = w.sites.find((s) => s.id === t.homeSiteId)!.docks.find((d) => d.id === t.dockId)!;
      expect(dock.truckId).toBe(t.id);
    }
    expect(t.cargo.pallets).toBeGreaterThanOrEqual(0);
    expect(t.cargo.pallets).toBeLessThanOrEqual(t.cargo.capacity);
  }
  for (const f of w.forklifts.values()) {
    expect(f.battery).toBeGreaterThanOrEqual(0);
    expect(f.battery).toBeLessThanOrEqual(100);
  }
}

/** Longest time any entity sat in one state, ignoring states that are legitimately long. */
function longestStall(w: World, type: 'truck_state' | 'forklift_state', ignore: string[]): number {
  const last = new Map<string, { to: string; t: number }>();
  let worst = 0;
  const close = (id: string, t: number) => {
    const prev = last.get(id);
    if (prev && !ignore.includes(prev.to)) worst = Math.max(worst, t - prev.t);
  };
  for (const e of w.log.events) {
    if (e.type === 'truck_removed') {
      // Inbound trucks end in `departing` and leave the map; removal closes their last state.
      close(e.entityId, e.t);
      last.delete(e.entityId);
      continue;
    }
    if (e.type !== type) continue;
    close(e.entityId, e.t);
    last.set(e.entityId, { to: String(e.payload?.to), t: e.t });
  }
  for (const id of last.keys()) close(id, w.t);
  return worst;
}

describe('30-minute headless soak', () => {
  it.each([20261021, 20261022, 20261023, 20261024, 20261025])('WH-01, seed %i: no stalls, every invariant holds', (seed) => {
    const w = createWorld(defaultConfig(seed));
    for (let minute = 0; minute < 30; minute++) {
      for (let i = 0; i < 600; i++) step(w);
      checkInvariants(w);
    }
    expect(w.t).toBeCloseTo(1800, 6);

    const handled = w.log.events.filter((e) => e.type === 'truck_state' && e.payload?.to === 'departing').length;
    expect(handled).toBeGreaterThanOrEqual(3);
    const types = new Set(w.log.events.map((e) => e.type));
    for (const t of ['truck_spawned', 'dock_state', 'pallet_state', 'forklift_state', 'shipment_step']) {
      expect(types).toContain(t);
    }
    expect(longestStall(w, 'truck_state', ['in_transit'])).toBeLessThan(20 * 60);
    // A full charge (20 → 95% at 4%/min) takes ~19 min, so charging is legitimately long too.
    expect(longestStall(w, 'forklift_state', ['idle', 'queued_for_charger', 'charging'])).toBeLessThan(10 * 60);
  });
});

describe('engine purity', () => {
  it('src/sim never imports React, three or app layers', () => {
    const dir = new URL('.', import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'testkit.ts')) {
      const src = readFileSync(new URL(file, dir), 'utf8');
      const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]!);
      for (const spec of imports) expect(spec, `${file} imports ${spec}`).toMatch(/^\.\/[a-zA-Z]+$/);
    }
  });
});
