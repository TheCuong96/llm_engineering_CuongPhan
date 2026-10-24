import { useLayoutEffect, useMemo, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { ISLAND_RADIUS } from '../sim/layout';
import { createRng } from '../sim/rng';
import { mat } from './palette';
import { pineFoliageGeometry, pineTrunkGeometry } from './shapes';

const foliage = pineFoliageGeometry();
const trunk = pineTrunkGeometry();

/** Footprints (peak-local x/z boxes) where trees must not grow: hall, vault. */
const BLOCKED: [number, number, number, number][] = [
  [-32, -18, -4, 10], // hall
  [-24, -14, -13, -3], // vault
];

/** Low-poly pines in two sizes ringing the plaza, clear of the pad edge (local +X) and buildings. */
export function Pines({ seed, count = 28 }: { seed: number; count?: number }) {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);

  const spots = useMemo(() => {
    const rng = createRng(seed + 101);
    const out: { x: number; z: number; s: number; r: number }[] = [];
    for (let tries = 0; out.length < count && tries < 2000; tries++) {
      const a = rng.range(-Math.PI, Math.PI);
      const r = rng.range(23.5, ISLAND_RADIUS - 2);
      if (Math.abs(a) < (60 * Math.PI) / 180) continue; // pad sector
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (BLOCKED.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.z - z) < 3.2)) continue;
      out.push({ x, z, s: rng.next() < 0.35 ? rng.range(1.25, 1.5) : rng.range(0.75, 1), r: rng.range(0, Math.PI) });
    }
    return out;
  }, [seed, count]);

  useLayoutEffect(() => {
    const o = new Object3D();
    spots.forEach((p, i) => {
      o.position.set(p.x, 0, p.z);
      o.rotation.set(0, p.r, 0);
      o.scale.setScalar(p.s);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      crowns.current!.setMatrixAt(i, o.matrix);
    });
    trunks.current!.instanceMatrix.needsUpdate = true;
    crowns.current!.instanceMatrix.needsUpdate = true;
  }, [spots]);

  return (
    <group>
      <instancedMesh name="pine-trunks" ref={trunks} args={[trunk, mat.wood, spots.length]} castShadow />
      <instancedMesh name="pine-crowns" ref={crowns} args={[foliage, mat.pine, spots.length]} castShadow />
    </group>
  );
}
