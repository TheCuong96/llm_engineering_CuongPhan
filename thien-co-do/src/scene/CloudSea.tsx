import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, Group, IcosahedronGeometry, InstancedMesh, Object3D } from 'three';
import { color } from '../design/tokens';
import type { Vec3 } from '../sim/geometry';
import { createRng } from '../sim/rng';
import { mat } from './palette';

export const CLOUD_BUDGET = 300; // spec §12

const puff = new IcosahedronGeometry(1, 2);

/** Instanced cloud puffs under the whole sect, white on top fading to cloud-low; the set drifts slowly. */
export function CloudSea({ center, count = 260 }: { center: Vec3; count?: number }) {
  const n = Math.min(count, CLOUD_BUDGET);
  const ref = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const top = useMemo(() => new Color(color.cloudTop), []);
  const low = useMemo(() => new Color(color.cloudLow), []);

  useLayoutEffect(() => {
    const rng = createRng(4242);
    const o = new Object3D();
    const c = new Color();
    for (let i = 0; i < n; i++) {
      // denser ring around the island, sparse far field
      const r = i < n * 0.4 ? rng.range(40, 380) : rng.range(380, 1000);
      const a = rng.range(0, Math.PI * 2);
      const y = rng.range(-78, -52);
      o.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      const s = rng.range(4, 9);
      o.scale.set(s * rng.range(1.2, 2.2), s * rng.range(0.3, 0.45), s * rng.range(0.9, 1.3));
      o.rotation.set(0, rng.range(0, Math.PI), 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, c.copy(low).lerp(top, (y + 78) / 26));
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [n, top, low]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.004;
  });

  return (
    <group ref={group} position={center}>
      <instancedMesh name="clouds" ref={ref} args={[puff, mat.cloud, n]} frustumCulled={false} />
    </group>
  );
}
