// World construction and the fixed-step tick. All sites advance together every tick.

import { TICK_DT } from './clock';
import type { WorldConfig } from './config';
import { EventLog } from './events';
import { dispatchForklifts, updateForklifts } from './forklifts';
import { APRON_Z, buildGeometry, chargerLocalPositions, DOCK_DEPTH, dockLocalX, toWorld } from './layout';
import { createRng } from './rng';
import { createPallet, type World } from './state';
import { checkLateShipments, maybeSpawn, updateTrucks } from './trucks';
import type { Forklift, Site } from './types';

export type { World } from './state';

export function createWorld(config: WorldConfig): World {
  const rng = createRng(config.seed);
  const world: World = {
    tick: 0,
    t: 0,
    startEpochMs: config.startEpochMs,
    rng,
    log: new EventLog(),
    sites: [],
    trucks: new Map(),
    forklifts: new Map(),
    pallets: new Map(),
    shipments: new Map(),
    carriers: config.carriers,
    catalog: new Map(config.catalog.map((d) => [d.sku, d])),
    customers: config.customers,
    drivers: config.drivers,
    siteDistancesKm: config.siteDistancesKm,
    counters: { truck: 2040, pallet: 1023, shipment: 78400, lot: 310 },
  };

  for (const preset of config.sites) {
    const xs = dockLocalX(preset.docks.length);
    const chargerPos = chargerLocalPositions(preset.chargers.length);
    const totalToday = preset.today.outbound + preset.today.putAways;
    const site: Site = {
      id: preset.id,
      name: preset.name,
      kind: preset.kind,
      address: preset.address,
      capacity: preset.capacity,
      docks: preset.docks.map((d, i) => ({
        id: `dock-${i + 1}`,
        label: d.label,
        direction: d.direction,
        state: 'available',
        pos: toWorld(preset, [xs[i]!, 0, DOCK_DEPTH]),
        apron: toWorld(preset, [xs[i]!, 0, APRON_Z]),
      })),
      chargers: preset.chargers.map((c, i) => ({
        ...c,
        queue: [],
        sessionsToday: 0,
        energyKwhToday: 0,
        pos: toWorld(preset, chargerPos[i]!),
      })),
      inventory: preset.inventory.map((item) => {
        const def = world.catalog.get(item.sku);
        if (!def) throw new Error(`unknown sku ${item.sku} in ${preset.id}`);
        return { ...item, name: def.name, icon: def.icon };
      }),
      worldPos: preset.worldPos,
      layout: preset.layout,
      kpiBaseline: preset.kpiBaseline,
      geometry: buildGeometry(preset),
      today: { ...preset.today },
      shipmentStats: { delivered: 0, onTime: 0 },
      arrivalEveryMin: preset.arrivalEveryMin,
      outboundShare: totalToday > 0 ? preset.today.outbound / totalToday : 0.5,
      nextArrivalAt: rng.range(5, 60),
    };
    world.sites.push(site);

    preset.staged.forEach((sku, i) => {
      createPallet(world, site.id, sku, 'staged', { kind: 'slot', ref: `yard-${i}` });
    });

    preset.forklifts.forEach((fp) => {
      // Every forklift starts on the home point; the renderer lines idle ones up side by side.
      const fl: Forklift = {
        ...fp,
        siteId: site.id,
        state: 'idle',
        movesToday: 0,
        pos: [...site.geometry.home],
      };
      world.forklifts.set(fl.id, fl);
    });
  }
  return world;
}

export function step(world: World): void {
  world.tick += 1;
  world.t = world.tick * TICK_DT;
  for (const site of world.sites) maybeSpawn(world, site);
  updateTrucks(world);
  updateForklifts(world);
  dispatchForklifts(world);
  checkLateShipments(world);
}

export function runFor(world: World, simSeconds: number): void {
  const ticks = Math.round(simSeconds / TICK_DT);
  for (let i = 0; i < ticks; i++) step(world);
}
