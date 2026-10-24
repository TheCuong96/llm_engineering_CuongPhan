import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, ConeGeometry, InstancedMesh, MeshLambertMaterial, Object3D } from 'three';
import { TICK_DT } from '../sim/clock';
import { motionPos } from '../sim/geometry';
import { useSim } from '../store/sim';
import { headingOf } from './entityPose';
import { pickHandlers } from './picking';

export const TRANSIT_CAPACITY = 40;

// A slim hull silhouette (bow toward +Z); detail is pointless at this distance.
const hull = new ConeGeometry(1.6, 9, 4).rotateX(Math.PI / 2).scale(1, 0.5, 1);
const material = new MeshLambertMaterial({ color: '#ffffff', flatShading: true });

declare global {
  interface Window {
    __transit?: { ids: string[] };
  }
}
const state = { ids: [] as string[] };
if (typeof window !== 'undefined') window.__transit = state;

/**
 * Ships flying between peaks (peakId = null, spec §7.4), instanced and tinted with their
 * guild's sail colour. Visible from any peak through the haze and in the sect overview.
 */
export function TransitShips() {
  const ref = useRef<InstancedMesh>(null);
  const o = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const pick = useMemo(
    () => pickHandlers((e) => (e.instanceId === undefined || !state.ids[e.instanceId] ? null : { kind: 'ship', id: state.ids[e.instanceId]! })),
    [],
  );

  useLayoutEffect(() => {
    for (let i = 0; i < TRANSIT_CAPACITY; i++) ref.current!.setColorAt(i, tint.set('#ffffff'));
    ref.current!.count = 0;
  }, [tint]);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const { world, clock } = useSim.getState();
    const t = world.t + clock.alpha * TICK_DT;
    let n = 0;
    for (const s of world.ships.values()) {
      if (n >= TRANSIT_CAPACITY) break;
      if (s.peakId !== null || !s.route || !s.motion) continue;
      const p = motionPos(s.motion, t);
      o.position.set(p[0], p[1], p[2]);
      o.rotation.set(0, headingOf(s.motion.from, s.motion.to) ?? 0, 0);
      o.updateMatrix();
      m.setMatrixAt(n, o.matrix);
      m.setColorAt(n, tint.set(world.guilds.find((g) => g.id === s.guildId)?.livery.sail ?? '#ffffff'));
      state.ids[n] = s.id;
      n++;
    }
    state.ids.length = n;
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.boundingSphere = null;
  });

  return <instancedMesh name="transit-ships" ref={ref} args={[hull, material, TRANSIT_CAPACITY]} frustumCulled={false} {...pick} />;
}
