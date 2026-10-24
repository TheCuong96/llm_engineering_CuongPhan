import { Select } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BoxGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
} from 'three';
import { CylinderGeometry, RingGeometry } from 'three';
import { color } from '../design/tokens';
import type { GatheringArray, Peak } from '../sim/types';
import { effects, useQuality } from '../store/quality';
import { useSim } from '../store/sim';
import { mat } from './palette';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';



export const PARTICLES_PER_ARRAY = 48; // 3 arrays max → 144, far under the 2,000 budget (spec §12)
const RADIUS = 3.4;

// Shared by every instance of this entity: ships and workers come and go all the time, and
// per-mount JSX geometry would churn GPU buffers (spec §12, P6 memory criterion).
const geo = {
  a0: new CylinderGeometry(RADIUS + 0.4, RADIUS + 0.6, 0.2, 8),
  a1: new CylinderGeometry(RADIUS, RADIUS, 0.04, 8),
  a2: new RingGeometry(RADIUS * 0.55, RADIUS * 0.62, 8),
};

const stoneGeo = new BoxGeometry(0.4, 1, 0.4).translate(0, 0.5, 0);
const motesGeo = new OctahedronGeometry(0.09, 0);
const discMat = new MeshBasicMaterial({ color: color.accentTint, transparent: true, opacity: 0.85 });
const ringMat = new MeshBasicMaterial({ color: color.accent, transparent: true, opacity: 0.35, depthWrite: false });
const moteMat = new MeshBasicMaterial({ color: '#CFC2F7', transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false });

function isGathering(peakWorkers: Map<string, { state: string; motion?: unknown }>, a: GatheringArray) {
  const w = a.occupantId ? peakWorkers.get(a.occupantId) : undefined;
  return Boolean(w && w.state === 'restoring' && !w.motion);
}

/** Tụ Linh Trận: softly lit octagon, eight standing stones, qi motes spiralling up while in use. */
export function GatheringArrays({ peak }: { peak: Peak }) {
  const stones = useRef<InstancedMesh>(null);
  const motes = useRef<InstancedMesh>(null);
  const o = useMemo(() => new Object3D(), []);
  const count = peak.arrays.length;

  useLayoutEffect(() => {
    let i = 0;
    for (const a of peak.arrays) {
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + Math.PI / 8;
        o.position.set(a.pos[0] + Math.cos(ang) * RADIUS, a.pos[1], a.pos[2] + Math.sin(ang) * RADIUS);
        o.rotation.set(0, -ang, 0);
        o.scale.set(1, 0.8 + (k % 2) * 0.4, 1);
        o.updateMatrix();
        stones.current!.setMatrixAt(i++, o.matrix);
      }
    }
    stones.current!.instanceMatrix.needsUpdate = true;
  }, [peak, o]);

  const particles = useQuality((q) => effects(q.level).particles);

  useFrame(({ clock }) => {
    const m = motes.current;
    if (!m) return;
    if (!particles) {
      m.count = 0;
      renderPoses.counts.motes = 0;
      return;
    }
    const { world } = useSim.getState();
    const t = clock.elapsedTime;
    let n = 0;
    peak.arrays.forEach((a) => {
      if (!isGathering(world.workers, a)) return;
      for (let k = 0; k < PARTICLES_PER_ARRAY; k++) {
        const phase = (t * 0.35 + k / PARTICLES_PER_ARRAY) % 1; // 0 at the rim → 1 overhead
        const ang = k * 2.399 + t * 1.2; // golden-angle spread, slow swirl
        const r = RADIUS * (1 - phase) * 0.95;
        o.position.set(a.pos[0] + Math.cos(ang) * r, a.pos[1] + 0.3 + phase * 4.5, a.pos[2] + Math.sin(ang) * r);
        o.rotation.set(0, 0, 0);
        o.scale.setScalar(1 - phase * 0.6);
        o.updateMatrix();
        m.setMatrixAt(n++, o.matrix);
      }
    });
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    renderPoses.counts.motes = n;
  });

  return (
    <group name="gathering-arrays">
      {peak.arrays.map((a) => (
        <group key={a.id} position={a.pos} name={`array:${a.id}`} {...pickHandlers(() => ({ kind: 'array', id: `${peak.id}/${a.id}` }))}>
          <mesh geometry={geo.a0} material={mat.stone} position={[0, 0.1, 0]} receiveShadow />
          <mesh geometry={geo.a1} material={discMat} position={[0, 0.22, 0]} />
          <Select enabled>
            <mesh geometry={geo.a2} material={ringMat} rotation={[-Math.PI / 2, 0, Math.PI / 8]} position={[0, 0.26, 0]} />
          </Select>
        </group>
      ))}
      <instancedMesh ref={stones} args={[stoneGeo, mat.stone, count * 8]} castShadow />
      <Select enabled>
      <instancedMesh name="qi-motes" ref={motes} args={[motesGeo, moteMat, count * PARTICLES_PER_ARRAY]} frustumCulled={false} />
      </Select>
    </group>
  );
}
