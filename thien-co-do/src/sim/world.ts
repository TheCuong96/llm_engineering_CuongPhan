// World construction and the fixed-step tick. All peaks advance together every tick.

import { TICK_DT } from './clock';
import type { WorldConfig } from './config';
import { EventLog } from './events';
import { arrayLocalPositions, buildGeometry, facingRad, padLocalPositions, toWorld } from './layout';
import { createRng } from './rng';
import { checkLateOrders, maybeSpawn, updateShips } from './ships';
import { createChest, emit, type World } from './state';
import type { Peak, Worker } from './types';
import { BARRIER_REGEN_PER_MIN, BARRIER_WEAK_BELOW, COLD_WARN_RATIO } from './tuning';
import { dispatchWorkers, updateWorkers } from './workers';

export type { World } from './state';

export function createWorld(config: WorldConfig): World {
  const rng = createRng(config.seed);
  const world: World = {
    tick: 0,
    t: 0,
    startEpochMs: config.startEpochMs,
    rng,
    log: new EventLog(),
    peaks: [],
    ships: new Map(),
    workers: new Map(),
    chests: new Map(),
    orders: new Map(),
    guilds: config.guilds,
    catalog: new Map(config.catalog.map((d) => [d.sku, d])),
    recipients: config.recipients,
    captains: config.captains,
    peakDistancesLi: config.peakDistancesLi,
    counters: { ship: 2040, chest: 1023, order: 78400, lot: 310 },
  };

  for (const preset of config.peaks) {
    const padPos = padLocalPositions(preset.pads.length);
    const arrayPos = arrayLocalPositions(preset.arrays.length);
    const totalToday = preset.today.outChests + preset.today.inChests;
    const peak: Peak = {
      id: preset.id,
      name: preset.name,
      kind: preset.kind,
      locationLabel: preset.locationLabel,
      capacity: preset.capacity,
      altitudeM: preset.altitudeM,
      pads: preset.pads.map((p, i) => ({
        id: `pad-${i + 1}`,
        label: p.label,
        direction: p.direction,
        state: 'free',
        pos: toWorld(preset, padPos[i]!),
      })),
      arrays: preset.arrays.map((a, i) => ({
        ...a,
        queue: [],
        sessionsToday: 0,
        qiToday: 0,
        pos: toWorld(preset, arrayPos[i]!),
      })),
      inventory: preset.inventory.map((item) => {
        const def = world.catalog.get(item.sku);
        if (!def) throw new Error(`unknown sku ${item.sku} in ${preset.id}`);
        return { ...item, name: def.name, icon: def.icon };
      }),
      barrier: { strength: 100, weak: false },
      worldPos: preset.worldPos,
      facingRad: facingRad(preset),
      layout: preset.layout,
      kpiBaseline: preset.kpiBaseline,
      geometry: buildGeometry(preset),
      today: { ...preset.today },
      orderStats: { delivered: 0, onTime: 0 },
      arrivalEveryMin: preset.arrivalEveryMin,
      outboundShare: totalToday > 0 ? preset.today.outChests / totalToday : 0.5,
      nextArrivalAt: rng.range(5, 60),
    };
    world.peaks.push(peak);

    preset.staged.forEach((sku, i) => {
      createChest(world, peak.id, sku, 'staged', { kind: 'slot', ref: `yard-${i}` });
    });

    preset.workers.forEach((wp, i) => {
      const home = peak.geometry.home;
      const worker: Worker = {
        ...wp,
        peakId: peak.id,
        state: 'idle',
        movesToday: 0,
        pos: [home[0] + (i % 3) * 1.5, home[1], home[2] + Math.floor(i / 3) * 1.5],
      };
      world.workers.set(worker.id, worker);
    });
  }
  return world;
}

function updateBarrier(world: World, peak: Peak): void {
  const b = peak.barrier;
  b.strength = Math.min(100, b.strength + (BARRIER_REGEN_PER_MIN / 60) * TICK_DT);
  const weak = b.strength < BARRIER_WEAK_BELOW;
  if (weak !== b.weak) {
    b.weak = weak;
    emit(world, weak ? 'barrier_weak' : 'barrier_recovered', peak.id, peak.id, { strength: b.strength });
  }
}

/** Cold-chain chests lose hàn khí whenever they are outside Hàn Băng Cốc's vault (spec §7.3). */
function updateColdChain(world: World): void {
  for (const c of world.chests.values()) {
    if (!c.needsCold) continue;
    const peak = world.peaks.find((p) => p.id === c.peakId);
    const keptCold = peak?.kind === 'cold_vault' && (c.state === 'in_vault' || c.state === 'staged');
    if (keptCold) continue;
    c.needsCold.minutesOutside += TICK_DT / 60;
    if (!c.needsCold.warned && c.needsCold.minutesOutside >= c.needsCold.maxMinutesOutside * COLD_WARN_RATIO) {
      c.needsCold.warned = true;
      emit(world, 'cold_warning', c.peakId, c.id, { minutesOutside: c.needsCold.minutesOutside });
    }
  }
}

export function step(world: World): void {
  world.tick += 1;
  world.t = world.tick * TICK_DT;
  for (const peak of world.peaks) {
    updateBarrier(world, peak);
    maybeSpawn(world, peak);
  }
  updateShips(world);
  updateWorkers(world);
  dispatchWorkers(world);
  updateColdChain(world);
  checkLateOrders(world);
}

export function runFor(world: World, simSeconds: number): void {
  const ticks = Math.round(simSeconds / TICK_DT);
  for (let i = 0; i < ticks; i++) step(world);
}
