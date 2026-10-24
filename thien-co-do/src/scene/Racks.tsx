import { useLayoutEffect, useRef } from 'react';
import { BoxGeometry, InstancedMesh, Object3D } from 'three';
import { mat } from './palette';

const post = new BoxGeometry(0.22, 3, 0.22).translate(0, 1.5, 0);
const shelf = new BoxGeometry(1, 0.12, 1.2);

// Two open racks behind the yard slots (peak-local; yard spans x 0–15, z −16…−6).
const RACKS = [
  { x: 4, z: -19.5, len: 7 },
  { x: 12, z: -19.5, len: 7 },
];
const SHELF_Y = [0.5, 1.5, 2.5];

/** Giá rương: wooden multi-tier frames in the yard, instanced posts and shelves. */
export function Racks() {
  const posts = useRef<InstancedMesh>(null);
  const shelves = useRef<InstancedMesh>(null);
  const postCount = RACKS.length * 4;
  const shelfCount = RACKS.length * SHELF_Y.length;

  useLayoutEffect(() => {
    const o = new Object3D();
    let p = 0;
    let s = 0;
    for (const r of RACKS) {
      for (const dx of [-r.len / 2, r.len / 2]) {
        for (const dz of [-0.5, 0.5]) {
          o.position.set(r.x + dx, 0, r.z + dz);
          o.scale.set(1, 1, 1);
          o.updateMatrix();
          posts.current!.setMatrixAt(p++, o.matrix);
        }
      }
      for (const y of SHELF_Y) {
        o.position.set(r.x, y, r.z);
        o.scale.set(r.len, 1, 1);
        o.updateMatrix();
        shelves.current!.setMatrixAt(s++, o.matrix);
      }
    }
    posts.current!.instanceMatrix.needsUpdate = true;
    shelves.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group name="racks">
      <instancedMesh ref={posts} args={[post, mat.wood, postCount]} castShadow />
      <instancedMesh ref={shelves} args={[shelf, mat.wood, shelfCount]} castShadow receiveShadow />
    </group>
  );
}
