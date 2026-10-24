// Where a selectable thing is, and how big its selection frame should be. Prefers the pose
// actually drawn this frame (renderPoses) and falls back to engine state, so it also works
// in the very first frame after a peak switch, before anything has been drawn.

import { vi } from '../i18n/vi';
import { add, type Vec3 } from '../sim/geometry';
import { slotPos } from '../sim/state';
import type { Selection } from '../sim/types';
import type { World } from '../sim/world';
import { chestChip, shipChip, workerChip } from '../hud/viewModels';
import { SHOULDER } from './entityPose';
import { renderPoses } from './renderPoses';

/** Half-size of the rune frame and label height above the anchor, per kind (metres). */
export const FRAME: Record<NonNullable<Selection>['kind'], { half: number; lift: number; flyDistance: number }> = {
  peak: { half: 38, lift: 4, flyDistance: 165 },
  ship: { half: 6.5, lift: 9, flyDistance: 70 },
  worker: { half: 1.7, lift: 3.4, flyDistance: 40 },
  chest: { half: 1, lift: 2.4, flyDistance: 36 },
  array: { half: 4.6, lift: 3, flyDistance: 50 },
};

export function entityPos(world: World, sel: Selection): Vec3 | null {
  if (!sel) return null;
  switch (sel.kind) {
    case 'peak':
      return world.peaks.find((p) => p.id === sel.id)?.geometry.center ?? null;
    case 'ship': {
      const s = world.ships.get(sel.id);
      if (!s || s.peakId === null) return null;
      return renderPoses.ships.get(sel.id)?.pos ?? s.pos;
    }
    case 'worker': {
      const w = world.workers.get(sel.id);
      return w ? (renderPoses.workers.get(sel.id)?.pos ?? w.pos) : null;
    }
    case 'chest': {
      const drawn = renderPoses.chests.get(sel.id);
      if (drawn) return drawn;
      const c = world.chests.get(sel.id);
      if (!c) return null;
      if (c.location.kind === 'slot') {
        const peak = world.peaks.find((p) => p.id === c.peakId);
        return peak ? slotPos(peak, c.location.ref) : null;
      }
      if (c.location.kind === 'worker') {
        const w = world.workers.get(c.location.ref);
        return w ? add(w.pos, SHOULDER) : null;
      }
      return world.ships.get(c.location.ref)?.pos ?? null;
    }
    case 'array': {
      const [peakId, arrayId] = sel.id.split('/');
      return world.peaks.find((p) => p.id === peakId)?.arrays.find((a) => a.id === arrayId)?.pos ?? null;
    }
  }
}

/** Floating chip text (spec §5.4): "DT-07 · Bốc lên thuyền", "LC-2205 · Đang dỡ", "R-1026 · Huyết Linh Chi". */
export function entityLabel(world: World, sel: Selection): string | null {
  if (!sel) return null;
  const L = vi.scene.label;
  switch (sel.kind) {
    case 'ship': {
      const s = world.ships.get(sel.id);
      return s ? L(s.id, shipChip(s).text) : null;
    }
    case 'worker': {
      const w = world.workers.get(sel.id);
      return w ? L(w.id, workerChip(w).text) : null;
    }
    case 'chest': {
      const c = world.chests.get(sel.id);
      return c ? L(c.id, c.needsCold?.warned ? chestChip(c).text : c.name) : null;
    }
    case 'array': {
      const [peakId, arrayId] = sel.id.split('/');
      const a = world.peaks.find((p) => p.id === peakId)?.arrays.find((x) => x.id === arrayId);
      if (!a) return null;
      return L(a.id, a.occupantId ? vi.chip.arrayBusy(a.occupantId) : vi.chip.arrayFree);
    }
    case 'peak': {
      const p = world.peaks.find((x) => x.id === sel.id);
      return p ? L(p.id, p.name) : null;
    }
  }
}

export function padLabel(world: World, padKey: string): string | null {
  const [peakId, padId] = padKey.split('/');
  const peak = world.peaks.find((p) => p.id === peakId);
  const pad = peak?.pads.find((p) => p.id === padId);
  if (!pad) return null;
  const ship = pad.shipId ? world.ships.get(pad.shipId) : undefined;
  return vi.scene.label(pad.label, ship ? shipChip(ship).text : vi.chip.padReady);
}
