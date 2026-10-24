import type { Vec3 } from '../sim/geometry';

/**
 * Poses written by truck/forklift components each frame and read by the instanced pallet
 * layer, so a pallet on the forks moves exactly with what is drawn. Also on window for e2e.
 */
export const renderPoses = {
  trucks: new Map<string, { pos: Vec3; heading: number }>(),
  forklifts: new Map<string, { pos: Vec3; heading: number }>(),
  /** Drawn pallet positions plus instance-index → pallet id maps (for picking in P5). */
  pallets: new Map<string, Vec3>(),
  palletIds: [] as string[],
  pinIds: [] as string[],
  counts: { pallets: 0, pins: 0 },
};

declare global {
  interface Window {
    __render?: typeof renderPoses;
  }
}
if (typeof window !== 'undefined') window.__render = renderPoses;
