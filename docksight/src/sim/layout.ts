// Site-local anchor points → world space. The scene (P2) reads the same positions from
// engine state, so what you see and what the engine simulates cannot drift apart.
//
// Local frame, metres: warehouse front wall along z = 0 facing +z, docks in front of it,
// access road along z = ROAD_Z with the gate at the yard entrance on the west side.

import { add, type Vec3 } from './geometry';
import type { SitePreset } from './config';
import type { SiteGeometry } from './types';

export const DOCK_SPACING = 8;
export const TRUCK_LENGTH = 13.5; // cab + trailer, bumper to bumper
/** Trailer rear stops this far from the wall, just past the dock leveller. */
export const DOCK_REAR_GAP = 2.4;
/** Wall → centre of a docked truck; trucks are positioned by their centre. */
export const DOCK_DEPTH = DOCK_REAR_GAP + TRUCK_LENGTH / 2;
/** Wall → where a forklift stands to reach into a docked trailer. */
export const APRON_Z = 1.2;
export const ROAD_Z = 34;
/** Outdoor pallet racking: two rows west of the warehouse with an aisle between them. */
export const RACK_AISLE_X = -51;
export const RACK_ROWS_X = [-54.2, -47.8];
export const RACK_Z: [number, number] = [-30, -7];
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
    rackDoor: w([RACK_AISLE_X, 0, -3]), // mouth of the aisle between the two rack rows
    home: w([34, 0, 6]),
    yardSlots,
  };
}
