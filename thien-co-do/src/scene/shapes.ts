// Procedural low-poly geometry (spec §5.2). No textures: flat-shaded colour only.

import { BufferGeometry, ConeGeometry, CylinderGeometry, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createRng } from '../sim/rng';

/**
 * Geometry built from parameters is cached: peaks remount when the view switches, and R3F
 * only disposes geometry it created from JSX, so rebuilding here would leak GPU buffers.
 */
const cache = new Map<string, BufferGeometry>();
function cached(key: string, build: () => BufferGeometry): BufferGeometry {
  let g = cache.get(key);
  if (!g) cache.set(key, (g = build()));
  return g;
}

/**
 * Hip roof with upturned corners: an apex over an 8-point eave ring where the four
 * corners sit `upturn` above the edge midpoints. Render double-sided so the soffit shows.
 */
export function roofGeometry(half: number, height: number, upturn: number): BufferGeometry {
  return cached(`roof:${half}:${height}:${upturn}`, () => buildRoof(half, height, upturn));
}

function buildRoof(half: number, height: number, upturn: number): BufferGeometry {
  const h = half;
  const ring: [number, number, number][] = [
    [h, 0, 0], [h, upturn, h], [0, 0, h], [-h, upturn, h],
    [-h, 0, 0], [-h, upturn, -h], [0, 0, -h], [h, upturn, -h],
  ];
  const pos: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    pos.push(0, height, 0, ...ring[(i + 1) % ring.length]!, ...ring[i]!);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Floating island underside: an inverted, jittered cone so every peak reads as hand-cut stone. */
export function islandBaseGeometry(radius: number, depth: number, seed: number): BufferGeometry {
  return cached(`island:${radius}:${depth}:${seed}`, () => buildIslandBase(radius, depth, seed));
}

function buildIslandBase(radius: number, depth: number, seed: number): BufferGeometry {
  const g = new CylinderGeometry(radius, radius * 0.08, depth, 11, 4);
  const rng = createRng(seed);
  const p = g.attributes.position!;
  // Jitter by position so the duplicated seam vertices move together (no cracks).
  const jitter = new Map<string, [number, number]>();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    if (y > depth / 2 - 0.01) continue; // keep the top rim flush with the plateau
    const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
    if (!jitter.has(key)) jitter.set(key, [1 + rng.range(-0.14, 0.14), rng.range(-1.2, 1.2)]);
    const [k, dy] = jitter.get(key)!;
    p.setXYZ(i, x * k, y + dy, z * k);
  }
  g.translate(0, -depth / 2, 0);
  return g.toNonIndexed();
}

/** Pine: three stacked cones merged into one geometry (instanced by the caller). */
export function pineFoliageGeometry(): BufferGeometry {
  const tiers = [
    new ConeGeometry(2.2, 3.2, 6).translate(0, 2.6, 0),
    new ConeGeometry(1.7, 2.8, 6).translate(0, 4.2, 0),
    new ConeGeometry(1.1, 2.2, 6).translate(0, 5.6, 0),
  ];
  return mergeGeometries(tiers)!;
}

export function pineTrunkGeometry(): BufferGeometry {
  return new CylinderGeometry(0.25, 0.35, 1.6, 5).translate(0, 0.8, 0);
}
