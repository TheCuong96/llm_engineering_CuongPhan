import type { Vec3 } from '../sim/geometry';

/**
 * Poses written by ship/worker components each frame and read by the instanced chest
 * layer, so a chest on a shoulder or a deck moves exactly with what is drawn.
 * Also exposed on window for e2e checks.
 */
export const renderPoses = {
  ships: new Map<string, { pos: Vec3; heading: number }>(),
  workers: new Map<string, { pos: Vec3; heading: number }>(),
  /** Drawn chest positions plus instance-index → chest id maps for picking instanced meshes. */
  chests: new Map<string, Vec3>(),
  chestIds: [] as string[],
  talismanIds: [] as string[],
  counts: { chests: 0, talismans: 0, motes: 0 },
};

declare global {
  interface Window {
    __render?: typeof renderPoses;
  }
}
if (typeof window !== 'undefined') window.__render = renderPoses;
