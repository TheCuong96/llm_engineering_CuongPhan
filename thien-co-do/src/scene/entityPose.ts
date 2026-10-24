// Pure mapping from engine state to render poses. Motions are analytic, so evaluating
// them at t + alpha·dt interpolates exactly between ticks (spec §7.4).

import { add, motionPos, type Vec3 } from '../sim/geometry';
import { slotPos, type World } from '../sim/state';
import type { Chest, Peak, Ship, Worker } from '../sim/types';

export interface Pose {
  pos: Vec3;
  /** Rotation about +Y; models face +Z. Undefined when standing still (keep last). */
  heading?: number;
  moving: boolean;
}

export function headingOf(from: Vec3, to: Vec3): number | undefined {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  return Math.hypot(dx, dz) < 1e-6 ? undefined : Math.atan2(dx, dz);
}

function movingPose(pos: Vec3, motion: { from: Vec3; to: Vec3; start: number; duration: number } | undefined, t: number): Pose {
  if (!motion) return { pos, moving: false };
  const done = t >= motion.start + motion.duration;
  return { pos: motionPos(motion, t), heading: headingOf(motion.from, motion.to), moving: !done };
}

/** Idle workers share one home point in the engine; fan them out so they don't overlap. */
export const IDLE_SPREAD = 1.6;

export function workerPose(w: Worker, t: number, index: number): Pose {
  const pose = movingPose(w.pos, w.motion, t);
  if (w.state === 'idle' && !pose.moving) {
    const a = (index / 4) * Math.PI * 2;
    return { ...pose, pos: add(pose.pos, [Math.cos(a) * IDLE_SPREAD, 0, Math.sin(a) * IDLE_SPREAD]) };
  }
  return pose;
}

export function shipPose(s: Ship, t: number): Pose {
  return movingPose(s.pos, s.motion, t);
}

/** Chest on the right shoulder, beside the (1.4× scaled) head, in worker-local space. */
export const SHOULDER: Vec3 = [-0.8, 2.15, 0];
export const DECK_Y = 1.25;

/** Chest stack on deck: two columns of four along the hull, in ship-local coordinates. */
export function deckSlot(i: number): Vec3 {
  return [i % 2 === 0 ? -0.55 : 0.55, DECK_Y + Math.floor(i / 8) * 0.65, -2.2 + (Math.floor(i / 2) % 4) * 1.05];
}

export function rotateY(v: Vec3, heading: number): Vec3 {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

export type ChestVariant = 'wood' | 'jade' | 'frost';

export function chestVariant(c: Chest): ChestVariant {
  if (c.needsCold) return 'frost';
  if (c.category === 'herb' && c.grade >= 3) return 'jade'; // precious herbs
  return 'wood';
}

/** Chests that get a floating talisman marker (spec §5.2): cold-chain or grade ≥ 3. */
export function isImportant(c: Chest): boolean {
  return Boolean(c.needsCold) || c.grade >= 3;
}

export interface ChestPlacement {
  pos: Vec3;
  heading: number;
}

/**
 * Where to draw a chest: yard slot / vault door, on a worker's shoulder, or stacked on a
 * ship's deck. Returns null for chests that are not on the viewed peak.
 */
export function chestPlacement(
  world: World,
  peak: Peak,
  chest: Chest,
  workerPoses: Map<string, { pos: Vec3; heading: number }>,
  shipPoses: Map<string, { pos: Vec3; heading: number }>,
  deckIndex: number,
): ChestPlacement | null {
  const { location } = chest;
  if (location.kind === 'slot') {
    if (chest.peakId !== peak.id) return null;
    return { pos: slotPos(peak, location.ref), heading: peak.facingRad };
  }
  if (location.kind === 'worker') {
    const w = workerPoses.get(location.ref);
    return w ? { pos: add(w.pos, rotateY(SHOULDER, w.heading)), heading: w.heading } : null;
  }
  const s = shipPoses.get(location.ref);
  if (!s || !world.ships.get(location.ref)) return null;
  return { pos: add(s.pos, rotateY(deckSlot(deckIndex), s.heading)), heading: s.heading };
}
