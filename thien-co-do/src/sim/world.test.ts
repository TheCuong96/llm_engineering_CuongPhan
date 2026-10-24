import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultConfig, peakPresets } from '../data/peaks';
import { busyPads, chestsOnHand, fillPct, onTimePct, peakKpis } from './selectors';
import { createWorld, runFor, step, type World } from './world';

describe('initial KPIs match spec §7.1', () => {
  const world = createWorld(defaultConfig());
  it.each(peakPresets.map((p) => [p.id, p] as const))('%s', (id, preset) => {
    expect(chestsOnHand(world, id)).toBe(preset.kpiBaseline.chestsOnHand);
    expect(onTimePct(world, id)).toBeCloseTo(preset.kpiBaseline.onTimePct30d, 9);
    expect(busyPads(world, id).total).toBe(preset.pads.length);
    expect(peakKpis(world, id).chestsOnHand.delta).toBe(0);
  });
  it('fill % for PH-01 and PH-04', () => {
    expect(Math.round(fillPct(world, 'PH-01'))).toBe(78);
    expect(Math.round(fillPct(world, 'PH-04'))).toBe(34);
  });
});

describe('determinism', () => {
  const run = (seed: number) => {
    const w = createWorld(defaultConfig(seed));
    runFor(w, 10 * 60);
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
  for (const peak of w.peaks) {
    const preset = peakPresets.find((p) => p.id === peak.id)!;
    // Conservation: stock only changes through unloading (in) and loading (out).
    const expected =
      preset.kpiBaseline.chestsOnHand +
      (peak.today.inChests - preset.today.inChests) -
      (peak.today.outChests - preset.today.outChests);
    expect(chestsOnHand(w, peak.id), `${peak.id} stock at t=${w.t}`).toBe(expected);

    for (const pad of peak.pads) {
      if (pad.state === 'free') {
        expect(pad.shipId).toBeUndefined();
      } else {
        expect(w.ships.get(pad.shipId!)?.padId, `${peak.id}/${pad.id}`).toBe(pad.id);
      }
    }
    for (const a of peak.arrays) {
      if (a.occupantId) expect(w.workers.get(a.occupantId)?.arrayId).toBe(a.id);
    }
    expect(peak.barrier.strength).toBeGreaterThanOrEqual(0);
    expect(peak.barrier.strength).toBeLessThanOrEqual(100);
  }
  for (const s of w.ships.values()) {
    if (s.padId) {
      const pad = w.peaks.find((p) => p.id === s.homePeakId)!.pads.find((p) => p.id === s.padId)!;
      expect(pad.shipId).toBe(s.id);
    }
    expect(s.cargo.chests).toBeGreaterThanOrEqual(0);
    expect(s.cargo.chests).toBeLessThanOrEqual(s.cargo.capacity);
  }
  for (const wk of w.workers.values()) {
    expect(wk.qi).toBeGreaterThanOrEqual(0);
    expect(wk.qi).toBeLessThanOrEqual(100);
  }
}

/** Longest time any entity sat in one state, ignoring states that are legitimately long. */
function longestStall(w: World, type: 'ship_state' | 'worker_state', ignore: string[]): number {
  const last = new Map<string, { to: string; t: number }>();
  let worst = 0;
  const close = (id: string, t: number) => {
    const prev = last.get(id);
    if (prev && !ignore.includes(prev.to)) worst = Math.max(worst, t - prev.t);
  };
  for (const e of w.log.events) {
    if (e.type !== type) continue;
    close(e.entityId, e.t);
    last.set(e.entityId, { to: String(e.payload?.to), t: e.t });
  }
  for (const id of last.keys()) close(id, w.t);
  return worst;
}

describe('30-minute headless soak', () => {
  it.each([['PH-01 only', ['PH-01']], ['all five peaks', undefined]] as const)('%s runs without stalls', (_name, ids) => {
    const w = createWorld(defaultConfig(20261023, ids ? [...ids] : undefined));
    for (let minute = 0; minute < 30; minute++) {
      for (let i = 0; i < 600; i++) step(w);
      checkInvariants(w);
    }
    expect(w.t).toBeCloseTo(1800, 6);

    // Outbound flights to recipients take 7–24 sim minutes, so measure handled ships, not deliveries.
    const handled = w.log.events.filter((e) => e.type === 'ship_state' && e.payload?.to === 'departing').length;
    expect(handled).toBeGreaterThanOrEqual(w.peaks.length * 3);
    expect(w.peaks.reduce((n, p) => n + p.orderStats.delivered, 0)).toBeGreaterThanOrEqual(1);
    const types = new Set(w.log.events.map((e) => e.type));
    for (const t of ['ship_spawned', 'barrier_opened', 'pad_state', 'chest_state', 'worker_state', 'order_step']) {
      expect(types).toContain(t);
    }
    expect(longestStall(w, 'ship_state', ['in_transit'])).toBeLessThan(25 * 60);
    expect(longestStall(w, 'worker_state', ['idle', 'queued_for_array'])).toBeLessThan(10 * 60);
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
