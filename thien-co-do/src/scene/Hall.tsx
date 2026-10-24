import { useLayoutEffect, useMemo, useRef } from 'react';
import { BufferGeometry, CylinderGeometry, InstancedMesh, Object3D } from 'three';
import type { Vec3 } from '../sim/geometry';
import { mat } from './palette';
import { roofGeometry } from './shapes';

interface Tier {
  w: number; // x extent
  d: number; // z extent
  h: number; // wall height
  y: number; // floor level
  roof: BufferGeometry;
}

/** Main hall: ivory walls, cinnabar pillars, stacked jade roofs with upturned eaves (spec §5.2). */
export function Hall({ position, tiers = 3 }: { position: Vec3; tiers?: number }) {
  const levels = useMemo(() => {
    const out: Tier[] = [];
    let y = 1.2;
    for (let i = 0; i < tiers; i++) {
      const k = 1 - i * 0.24;
      const w = 11 * k;
      const t = { w, d: 9 * k, h: i === 0 ? 4.2 : 3, y, roof: roofGeometry(w * 0.62, i === tiers - 1 ? 3.2 : 1.6, 0.9) };
      out.push(t);
      y += t.h + 1.4;
    }
    return out;
  }, [tiers]);

  return (
    <group position={position}>
      {/* stone podium with a step */}
      <mesh material={mat.stone} position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[15, 0.8, 12.5]} />
      </mesh>
      <mesh material={mat.stone} position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[13.2, 0.4, 10.8]} />
      </mesh>
      {levels.map((t, i) => (
        <group key={i} position={[0, t.y, 0]}>
          <mesh material={mat.wall} position={[0, t.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[t.w * 0.82, t.h, t.d * 0.78]} />
          </mesh>
          <Pillars w={t.w * 0.9} d={t.d * 0.86} h={t.h} />
          <mesh
            geometry={t.roof}
            material={mat.roof}
            position={[0, t.h, 0]}
            scale={[1, 1, t.d / t.w]}
            castShadow
          />
          {i === 0 && (
            // blank signboard over the entrance (no calligraphy, spec §12)
            <mesh material={mat.wood} position={[t.w * 0.42, t.h * 0.8, 0]}>
              <boxGeometry args={[0.2, 0.8, 2.2]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

const pillarGeometry = new CylinderGeometry(0.28, 0.32, 1, 6).translate(0, 0.5, 0);

function Pillars({ w, d, h }: { w: number; d: number; h: number }) {
  const ref = useRef<InstancedMesh>(null);
  const spots = useMemo(() => {
    const s: [number, number][] = [];
    for (const x of [-0.5, -0.17, 0.17, 0.5]) for (const z of [-0.5, 0.5]) s.push([x * w, z * d]);
    for (const z of [-0.17, 0.17]) for (const x of [-0.5, 0.5]) s.push([x * w, z * d]);
    return s;
  }, [w, d]);

  useLayoutEffect(() => {
    const o = new Object3D();
    spots.forEach(([x, z], i) => {
      o.position.set(x, 0, z);
      o.scale.set(1, h, 1);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [spots, h]);

  return <instancedMesh ref={ref} args={[pillarGeometry, mat.pillar, spots.length]} castShadow />;
}
