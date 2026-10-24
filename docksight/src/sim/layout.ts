// Site-local anchor points → world space. The scene (P2) reads the same positions from
// engine state, so what you see and what the engine simulates cannot drift apart.
//
// Local frame, metres: warehouse front wall along z = 0 facing +z, docks in front of it,
// access road along z = ROAD_Z with the gate at the yard entrance on the west side.

import { add, type Vec3 } from './geometry';
import type { SitePreset } from './config';
import type { SiteGeometry } from './types';

export const DOCK_SPACING = 8;
export const DOCK_DEPTH = 14; // door → parked trailer rear
export const ROAD_Z = 34;
const APPROACH_DISTANCE = 260;

export const toWorld = (preset: SitePreset, local: Vec3): Vec3 => add(preset.worldPos, local);

export function dockLocalX(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * DOCK_SPACING);
}

export function chargerLocalPositions(count: number): Vec3[] {
  return Array.from({ length: count }, (_, i): Vec3 => [44, 0, 4 + i * 4]);
}

export function buildGeometry(preset: SitePreset): SiteGeometry {
  const w = (p: Vec3) => toWorld(preset, p);
  const yardSlots: Vec3[] = [];
  for (const z of [6, 9]) for (const x of [-40, -36, -32, -28]) yardSlots.push(w([x, 0, z]));
  return {
    center: w([0, 0, 0]),
    gate: w([-50, 0, ROAD_Z - 6]),
    approachFrom: w([-APPROACH_DISTANCE, 0, ROAD_Z]),
    exitTo: w([APPROACH_DISTANCE, 0, ROAD_Z]),
    rackDoor: w([-20, 0, 1]),
    home: w([34, 0, 6]),
    yardSlots,
  };
}
