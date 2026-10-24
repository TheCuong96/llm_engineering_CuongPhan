// Peak-local anchor points → world space. The scene (P2) reads the same positions from
// engine state, so what you see and what the engine simulates cannot drift apart.

import { add, type Vec3 } from './geometry';
import type { PeakPreset } from './config';
import type { PeakGeometry } from './types';

export const ISLAND_RADIUS = 34;
export const PAD_RADIUS = 30;
export const BARRIER_RADIUS = 55;
const GATE_ALTITUDE = 12;
const APPROACH_DISTANCE = 900;

export function facingRad(preset: PeakPreset): number {
  if (preset.facingDeg !== undefined) return (preset.facingDeg * Math.PI) / 180;
  const [x, , z] = preset.worldPos;
  return Math.atan2(-z, x); // local +X points away from the sect centre
}

/** Local frame: +X is the pad edge, Y up. Rotate about Y, then translate. */
export function toWorld(preset: PeakPreset, local: Vec3): Vec3 {
  const a = facingRad(preset);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return add(preset.worldPos, [local[0] * c + local[2] * s, local[1], -local[0] * s + local[2] * c]);
}

function polar(radius: number, deg: number, y = 0): Vec3 {
  const r = (deg * Math.PI) / 180;
  return [radius * Math.cos(r), y, radius * Math.sin(r)];
}

export function padLocalPositions(count: number): Vec3[] {
  const spread = Math.min(30 * (count - 1), 110);
  return Array.from({ length: count }, (_, i) =>
    polar(PAD_RADIUS, count === 1 ? 0 : -spread / 2 + (spread * i) / (count - 1)),
  );
}

export function arrayLocalPositions(count: number): Vec3[] {
  const spots: Vec3[] = [[-6, 0, 18], [8, 0, 20], [-20, 0, 12]];
  return spots.slice(0, count);
}

export function buildGeometry(preset: PeakPreset): PeakGeometry {
  const w = (p: Vec3) => toWorld(preset, p);
  const yardSlots: Vec3[] = [];
  for (const z of [-16, -11, -6]) for (const x of [0, 5, 10, 15]) yardSlots.push(w([x, 0, z]));
  return {
    center: w([0, 0, 0]),
    gate: w([BARRIER_RADIUS, GATE_ALTITUDE, 0]),
    approachFrom: w([APPROACH_DISTANCE, 40, 0]),
    exitTo: w(polar(APPROACH_DISTANCE, 25, 50)),
    vaultDoor: w([-14, 0, -8]),
    home: w([-8, 0, 2]),
    yardSlots,
  };
}
