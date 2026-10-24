import { useLayoutEffect, useRef } from 'react';
import { Euler, Matrix4, Quaternion, Vector3, type BufferGeometry, type InstancedMesh, type Material } from 'three';
import type { Vec3 } from '../sim/geometry';

export interface Placement {
  pos: Vec3;
  scale?: Vec3;
  rotY?: number;
}

const m = new Matrix4();
const q = new Quaternion();
const e = new Euler();
const p = new Vector3();
const s = new Vector3();

/**
 * One draw call for every copy of a shape (spec 9: repeated props use InstancedMesh).
 * The name is what e2e checks read back through window.__instanced.
 */
export function Instanced({
  name,
  geometry,
  material,
  placements,
  castShadow = true,
  receiveShadow = false,
}: {
  name: string;
  geometry: BufferGeometry;
  material: Material;
  placements: Placement[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    placements.forEach((pl, i) => {
      q.setFromEuler(e.set(0, pl.rotY ?? 0, 0));
      m.compose(p.set(...pl.pos), q, s.set(...(pl.scale ?? [1, 1, 1])));
      mesh.setMatrixAt(i, m);
    });
    mesh.count = placements.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);
  return (
    <instancedMesh
      ref={ref}
      name={name}
      args={[geometry, material, Math.max(placements.length, 1)]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}
