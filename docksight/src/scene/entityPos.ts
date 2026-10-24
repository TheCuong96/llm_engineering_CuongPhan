// Where a selectable thing is, and how big its selection frame should be. Prefers the pose
// actually drawn this frame (renderPoses) and falls back to engine state, so it also works
// in the very first frame after a site switch, before anything has been drawn.

import { add, type Vec3 } from '../sim/geometry';
import { slotPos } from '../sim/state';
import type { Selection } from '../sim/types';
import type { World } from '../sim/world';
import { chargerChip, forkliftChip, truckChip } from '../hud/viewModels';
import { FORKS } from './entityPose';
import { renderPoses } from './renderPoses';

/** Half-size of the corner frame, label height above the anchor, and fly-to distance (metres). */
export const FRAME: Record<NonNullable<Selection>['kind'], { half: number; lift: number; flyDistance: number }> = {
  site: { half: 40, lift: 12, flyDistance: 235 },
  truck: { half: 7.5, lift: 5.6, flyDistance: 75 },
  forklift: { half: 2, lift: 3.8, flyDistance: 40 },
  pallet: { half: 1.1, lift: 4.4, flyDistance: 36 },
  charger: { half: 2.4, lift: 3, flyDistance: 45 },
};

const chargerOf = (world: World, selId: string) => {
  const [siteId, chargerId] = selId.split('/');
  return world.sites.find((s) => s.id === siteId)?.chargers.find((c) => c.id === chargerId);
};

export function entityPos(world: World, sel: Selection): Vec3 | null {
  if (!sel) return null;
  switch (sel.kind) {
    case 'site':
      return world.sites.find((s) => s.id === sel.id)?.geometry.center ?? null;
    case 'truck': {
      const t = world.trucks.get(sel.id);
      if (!t || t.siteId === null) return null;
      return renderPoses.trucks.get(sel.id)?.pos ?? t.pos;
    }
    case 'forklift': {
      const f = world.forklifts.get(sel.id);
      return f ? (renderPoses.forklifts.get(sel.id)?.pos ?? f.pos) : null;
    }
    case 'pallet': {
      const drawn = renderPoses.pallets.get(sel.id);
      if (drawn) return drawn;
      const p = world.pallets.get(sel.id);
      if (!p) return null;
      if (p.location.kind === 'slot') {
        const site = world.sites.find((s) => s.id === p.siteId);
        return site ? slotPos(site, p.location.ref) : null;
      }
      if (p.location.kind === 'forklift') {
        const f = world.forklifts.get(p.location.ref);
        return f ? add(f.pos, FORKS) : null;
      }
      return null; // inside a trailer: not drawn, nothing to frame
    }
    case 'charger':
      return chargerOf(world, sel.id)?.pos ?? null;
  }
}

/** Floating chip text (spec 5.4): "FL-01 · Loading truck", "TRK-2205 · Unloading", "PAL-1026 · Safety Helmet". */
export function entityLabel(world: World, sel: Selection): string | null {
  if (!sel) return null;
  switch (sel.kind) {
    case 'truck': {
      const t = world.trucks.get(sel.id);
      return t ? `${t.id} · ${truckChip(t).text}` : null;
    }
    case 'forklift': {
      const f = world.forklifts.get(sel.id);
      return f ? `${f.id} · ${forkliftChip(f).text}` : null;
    }
    case 'pallet': {
      const p = world.pallets.get(sel.id);
      return p ? `${p.id} · ${p.name}` : null;
    }
    case 'charger': {
      const c = chargerOf(world, sel.id);
      return c ? `${c.id} · ${chargerChip(c).text}` : null;
    }
    case 'site': {
      const s = world.sites.find((x) => x.id === sel.id);
      return s ? `${s.id} · ${s.name}` : null;
    }
  }
}

/** Hovered dock label (spec 5.4: "In 2 · Docking"), or "Bay 1 · Available" when empty. */
export function dockHoverLabel(world: World, dockKey: string): string | null {
  const [siteId, dockId] = dockKey.split('/');
  const dock = world.sites.find((s) => s.id === siteId)?.docks.find((d) => d.id === dockId);
  if (!dock) return null;
  const truck = dock.truckId ? world.trucks.get(dock.truckId) : undefined;
  return `${dock.label} · ${truck ? truckChip(truck).text : dock.state === 'reserved' ? 'Reserved' : 'Available'}`;
}
