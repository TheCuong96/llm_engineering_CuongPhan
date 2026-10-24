import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { DodecahedronGeometry, Group, InstancedMesh, Object3D } from 'three';
import { ISLAND_RADIUS } from '../sim/layout';
import { createRng } from '../sim/rng';
import { mat } from './palette';
import { pickHandlers } from './picking';
import { islandBaseGeometry } from './shapes';

const PLATEAU_H = 2.4;
const PLAZA_R = 22;

/** Floating island: grassy plateau, paper-white plaza, jagged underside, drifting rock shards. */
export function Island({ seed, peakId, snowy = false }: { seed: number; peakId: string; snowy?: boolean }) {
  const pick = useMemo(() => pickHandlers(() => ({ kind: 'peak', id: peakId })), [peakId]);
  const base = useMemo(() => islandBaseGeometry(ISLAND_RADIUS * 0.97, 34, seed), [seed]);
  return (
    <group>
      <mesh material={snowy ? mat.snow : mat.grass} position={[0, -PLATEAU_H / 2, 0]} receiveShadow {...pick}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS * 0.97, PLATEAU_H, 22]} />
      </mesh>
      <mesh material={mat.paper} position={[0, 0.03, 0]} receiveShadow {...pick}>
        <cylinderGeometry args={[PLAZA_R, PLAZA_R, 0.06, 28]} />
      </mesh>
      <mesh geometry={base} material={mat.stone} position={[0, -PLATEAU_H, 0]} castShadow />
      <RockShards seed={seed} />
    </group>
  );
}

const shardGeometry = new DodecahedronGeometry(1, 0);

function RockShards({ seed }: { seed: number }) {
  const ref = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const count = 9;

  useLayoutEffect(() => {
    const rng = createRng(seed + 7);
    const o = new Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rng.range(-0.3, 0.3);
      const r = rng.range(16, 30);
      o.position.set(Math.cos(a) * r, rng.range(-26, -10), Math.sin(a) * r);
      o.rotation.set(rng.next() * 3, rng.next() * 3, rng.next() * 3);
      o.scale.setScalar(rng.range(1.2, 3));
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [seed]);

  // One transform for the whole set keeps the bobbing free (no per-instance updates).
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.6;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={ref} args={[shardGeometry, mat.stone, count]} />
    </group>
  );
}
