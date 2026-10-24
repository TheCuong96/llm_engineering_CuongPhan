import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CapsuleGeometry, Group, MeshBasicMaterial, MeshLambertMaterial } from 'three';
import { BoxGeometry, CylinderGeometry, IcosahedronGeometry } from 'three';
import { color } from '../design/tokens';
import { TICK_DT } from '../sim/clock';
import type { Worker } from '../sim/types';
import { useSim } from '../store/sim';
import { workerPose } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

// Shared by every instance of this entity: ships and workers come and go all the time, and
// per-mount JSX geometry would churn GPU buffers (spec §12, P6 memory criterion).
const geo = {
  w0: new CylinderGeometry(0.36, 0.36, 0.12, 8),
  w1: new IcosahedronGeometry(0.27, 1),
  w2: new IcosahedronGeometry(0.13, 0),
  w3: new BoxGeometry(0.8, 0.8, 0.6),
  w4: new BoxGeometry(0.5, 0.4, 0.45),
  w5: new BoxGeometry(0.08, 0.06, 0.02),
  w6: new BoxGeometry(0.18, 0.4, 0.18),
  w7: new BoxGeometry(0.2, 0.36, 0.26),
};


// Figures are drawn ~1.4× life size so they read at the default camera distance.
const FIGURE_SCALE = 1.4;

const robe = new MeshLambertMaterial({ color: '#FBFAF7', flatShading: true });
const sash = new MeshLambertMaterial({ color: color.accent, flatShading: true });
const skin = new MeshLambertMaterial({ color: '#E8C9A8', flatShading: true });
const hair = new MeshLambertMaterial({ color: '#2B2630', flatShading: true });
const brass = new MeshLambertMaterial({ color: '#B08A4A', flatShading: true });
const brassDark = new MeshLambertMaterial({ color: '#7E6234', flatShading: true });
const eyeGlow = new MeshBasicMaterial({ color: '#F4E7C2' });
const body = new CapsuleGeometry(0.34, 0.75, 3, 8).translate(0, 0.72, 0);

/** Shared driver: pose from the engine, walk bob, meditation pose while restoring. */
function useWorkerFrame(worker: Worker, index: number, ref: React.RefObject<Group | null>, animate: (g: Group, t: number, moving: boolean) => void) {
  const heading = useRef(0);
  useFrame(({ clock: three }) => {
    const g = ref.current;
    if (!g) return;
    const { world, clock } = useSim.getState();
    const pose = workerPose(worker, world.t + clock.alpha * TICK_DT, index);
    if (pose.heading !== undefined && pose.moving) heading.current = pose.heading;
    g.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
    g.rotation.y = heading.current;
    animate(g, three.elapsedTime, pose.moving);
    renderPoses.workers.set(worker.id, { pos: [g.position.x, g.position.y, g.position.z], heading: heading.current });
  });
}

/** Đệ tử: white robe with a violet sash, round head with a hair bun; sits cross-legged on an array. */
export function Disciple({ worker, index }: { worker: Worker; index: number }) {
  const ref = useRef<Group>(null);
  const figure = useRef<Group>(null);
  const pick = useMemo(() => pickHandlers(() => ({ kind: 'worker', id: worker.id })), [worker.id]);
  useWorkerFrame(worker, index, ref, (_g, t, moving) => {
    const f = figure.current!;
    const meditating = worker.state === 'restoring' && !moving;
    f.position.y = moving ? Math.abs(Math.sin(t * 9)) * 0.12 : 0;
    f.scale.y = meditating ? 0.72 : 1;
    f.rotation.x = moving ? 0.08 : 0;
  });
  return (
    <group ref={ref} name={`worker:${worker.id}`} {...pick}>
      <group ref={figure} scale={FIGURE_SCALE}>
        <mesh geometry={body} material={robe} castShadow />
        <mesh geometry={geo.w0} material={sash} position={[0, 0.78, 0]} />
        <mesh geometry={geo.w1} material={skin} position={[0, 1.55, 0]} castShadow />
        <mesh geometry={geo.w2} material={hair} position={[0, 1.82, -0.06]} />
      </group>
    </group>
  );
}

/** Khôi lỗi: brass box body, glowing eyes, two-segment legs with a stiff gait. */
export function Puppet({ worker, index }: { worker: Worker; index: number }) {
  const ref = useRef<Group>(null);
  const legs = useRef<(Group | null)[]>([]);
  const pick = useMemo(() => pickHandlers(() => ({ kind: 'worker', id: worker.id })), [worker.id]);
  useWorkerFrame(worker, index, ref, (_g, t, moving) => {
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = moving ? Math.sign(Math.sin(t * 5 + i * Math.PI)) * 0.35 : 0; // stiff, two-step
    });
  });
  return (
    <group ref={ref} name={`worker:${worker.id}`} {...pick}>
      <group scale={FIGURE_SCALE}>
        <mesh geometry={geo.w3} material={brass} position={[0, 1.15, 0]} castShadow />
        <mesh geometry={geo.w4} material={brassDark} position={[0, 1.75, 0]} castShadow />
        {[-0.11, 0.11].map((x) => (
          <mesh geometry={geo.w5} key={x} material={eyeGlow} position={[x, 1.78, 0.23]} />
        ))}
        {[-0.22, 0.22].map((x, i) => (
          <group key={x} ref={(el) => void (legs.current[i] = el)} position={[x, 0.75, 0]}>
            <mesh geometry={geo.w6} material={brassDark} position={[0, -0.2, 0]} />
            <mesh geometry={geo.w7} material={brass} position={[0, -0.55, 0.04]} />
          </group>
        ))}
      </group>
    </group>
  );
}

export function Workers({ peakId }: { peakId: string }) {
  const world = useSim((s) => s.world);
  const workers = [...world.workers.values()].filter((w) => w.peakId === peakId);
  return (
    <group name="workers">
      {workers.map((w, i) =>
        w.kind === 'puppet' ? <Puppet key={w.id} worker={w} index={i} /> : <Disciple key={w.id} worker={w} index={i} />,
      )}
    </group>
  );
}

