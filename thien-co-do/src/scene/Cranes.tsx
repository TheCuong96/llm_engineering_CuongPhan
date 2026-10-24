import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferGeometry, DoubleSide, Float32BufferAttribute, InstancedMesh, MeshLambertMaterial, Object3D } from 'three';
import type { Vec3 } from '../sim/geometry';
import { effects, useQuality } from '../store/quality';

export const CRANE_COUNT = 9;

/** A crane: slim body and two swept wings meeting at the shoulders (bow toward +Z). */
function craneGeometry(): BufferGeometry {
  // body ridge + left wing + right wing, triangles in one buffer
  const p = [
    0, 0, 1.4,   0.12, 0, -1,   -0.12, 0, -1, // body
    0, 0, 0.3,   -2.2, 0.15, -0.5,   0, 0, -0.4, // left wing
    0, 0, 0.3,   0, 0, -0.4,   2.2, 0.15, -0.5, // right wing
  ];
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  return g;
}

const geometry = craneGeometry();
const material = new MeshLambertMaterial({ color: '#FBFAF7', side: DoubleSide, flatShading: true });

/**
 * Đàn hạc (spec §5.2): a small instanced flock gliding a slow loop around the viewed peak,
 * wings beating out of phase. Third to go when quality drops.
 */
export function Cranes({ center }: { center: Vec3 }) {
  const ref = useRef<InstancedMesh>(null);
  const on = useQuality((s) => effects(s.level).cranes);
  const o = useMemo(() => new Object3D(), []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m || !on) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < CRANE_COUNT; i++) {
      // V formation trailing the leader
      const a = t * 0.05 - (Math.floor((i + 1) / 2) * 0.025);
      const side = i === 0 ? 0 : i % 2 === 0 ? 1 : -1;
      const r = 150 + side * Math.floor((i + 1) / 2) * 2.5;
      const x = center[0] + Math.cos(a) * r;
      const z = center[2] + Math.sin(a) * r * 0.75;
      // Wide loop outside the island at mid height: seen against the cloud sea, never across the lens.
      const y = center[1] + 22 + Math.sin(t * 0.4 + i) * 1.2;
      o.position.set(x, y, z);
      o.rotation.set(0, Math.atan2(-Math.sin(a) * r, Math.cos(a) * r * 0.75), 0); // heading along the path
      o.scale.set(1.2, 1.2 + Math.sin(t * 5 + i * 0.9) * 1, 1.2); // wing beat
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh name="cranes" ref={ref} args={[geometry, material, CRANE_COUNT]} visible={on} frustumCulled={false} raycast={() => null} />;
}
