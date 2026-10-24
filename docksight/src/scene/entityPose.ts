// Pure mapping from engine state to render poses. Motions are analytic, so evaluating
// them at t + alpha·dt interpolates exactly between ticks (spec 7.4).

import { add, motionPos, type Motion, type Vec3 } from '../sim/geometry';
import { slotPos } from '../sim/state';
import type { Forklift, Pallet, Site, Truck } from '../sim/types';

export interface Pose {
  pos: Vec3;
  /** Rotation about +Y; models face +Z. Undefined when standing still (keep the last one). */
  heading?: number;
  moving: boolean;
}

export function headingOf(from: Vec3, to: Vec3): number | undefined {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  return Math.hypot(dx, dz) < 1e-6 ? undefined : Math.atan2(dx, dz);
}

function movingPose(pos: Vec3, motion: Motion | undefined, t: number): Pose {
  if (!motion) return { pos, moving: false };
  const done = t >= motion.start + motion.duration;
  return { pos: motionPos(motion, t), heading: headingOf(motion.from, motion.to), moving: !done };
}

/** A docked truck's nose points straight away from the dock wall (+z). */
export const BAY_HEADING = 0;

/** Shortest-way blend between two angles. */
export function lerpAngle(a: number, b: number, k: number): number {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * k;
}

const smooth = (k: number) => k * k * (3 - 2 * k);

/**
 * Trucks back into a bay (spec 7.3). The engine moves them in a straight line from the gate,
 * so the nose starts opposite to travel and swings round to square up with the bay lines
 * as the truck closes in. While loading or unloading it sits square in the bay.
 */
export function truckPose(truck: Truck, t: number): Pose {
  const pose = movingPose(truck.pos, truck.motion, t);
  if (truck.state === 'docking' && truck.motion && pose.heading !== undefined) {
    const k = Math.min(Math.max((t - truck.motion.start) / truck.motion.duration, 0), 1);
    pose.heading = lerpAngle(pose.heading + Math.PI, BAY_HEADING, smooth(k));
  } else if (truck.state === 'loading' || truck.state === 'unloading') {
    pose.heading = BAY_HEADING;
  }
  return pose;
}

/**
 * Idle forklifts share one home point in the engine; park them side by side in a row
 * (toward the warehouse, away from the chargers) so they never overlap. A forklift is
 * ~1.3 m wide, so 2.4 m leaves a clear gap.
 */
export const IDLE_SPACING = 2.4;

export function forkliftPose(fl: Forklift, t: number, index: number): Pose {
  const pose = movingPose(fl.pos, fl.motion, t);
  if (fl.state === 'idle' && !pose.moving) {
    return { ...pose, pos: add(pose.pos, [-index * IDLE_SPACING, 0, 0]) };
  }
  return pose;
}

/** Pallet on the forks, in forklift-local space (the forklift faces +Z). */
export const FORKS: Vec3 = [0, 0.35, 1.75];

export function rotateY(v: Vec3, heading: number): Vec3 {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

export interface PalletPlacement {
  pos: Vec3;
  heading: number;
}

/**
 * Where to draw a pallet: its yard slot or the racking door, or on a forklift's forks.
 * Pallets inside a trailer are not drawn (the trailer is closed); they show as n/6 in the HUD.
 */
export function palletPlacement(
  site: Site,
  pallet: Pallet,
  forkliftPoses: Map<string, { pos: Vec3; heading: number }>,
): PalletPlacement | null {
  const { location } = pallet;
  if (location.kind === 'slot') {
    return pallet.siteId === site.id ? { pos: slotPos(site, location.ref), heading: 0 } : null;
  }
  if (location.kind === 'forklift') {
    const f = forkliftPoses.get(location.ref);
    return f ? { pos: add(f.pos, rotateY(FORKS, f.heading)), heading: f.heading } : null;
  }
  return null;
}

/** Pallets waiting in the yard carry a floating locator pin (spec 5.2, 5.4: "Luôn hiện"). */
export const hasPin = (p: Pallet) => p.state === 'staged';
