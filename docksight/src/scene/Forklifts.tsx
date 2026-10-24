import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BoxGeometry, CylinderGeometry, Group, MeshLambertMaterial } from 'three';
import { TICK_DT } from '../sim/clock';
import type { Forklift } from '../sim/types';
import { useSim } from '../store/sim';
import { forkliftPose, FORKS } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

// Drawn ~1.3× life size so it reads at the default camera distance; FORKS in entityPose
// is in this model's space. Faces +Z.
const geo = {
  body: new BoxGeometry(1.3, 0.9, 2.0),
  counterweight: new BoxGeometry(1.3, 0.7, 0.5),
  seat: new BoxGeometry(0.6, 0.35, 0.55),
  guardPost: new BoxGeometry(0.09, 1.5, 0.09),
  guardTop: new BoxGeometry(1.2, 0.08, 1.2),
  mastPost: new BoxGeometry(0.14, 2.6, 0.14),
  mastBar: new BoxGeometry(1.0, 0.12, 0.12),
  fork: new BoxGeometry(0.14, 0.07, 1.25),
  wheel: new CylinderGeometry(0.32, 0.32, 0.3, 10).rotateZ(Math.PI / 2),
};
const paint = new MeshLambertMaterial({ color: '#f2a32c', flatShading: true }); // yellow-orange (spec 5.2)
const black = new MeshLambertMaterial({ color: '#23263a', flatShading: true });

function ForkliftModel({ fl, index }: { fl: Forklift; index: number }) {
  const ref = useRef<Group>(null);
  const forks = useRef<Group>(null);
  const heading = useRef(0);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const { world, clock } = useSim.getState();
    const pose = forkliftPose(fl, world.t + clock.alpha * TICK_DT, index);
    if (pose.heading !== undefined && pose.moving) heading.current = pose.heading;
    g.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
    g.rotation.y = heading.current;
    // Forks ride up a little when carrying, so the load clears the ground.
    if (forks.current) forks.current.position.y = fl.carrying ? 0.2 : 0;
    renderPoses.forklifts.set(fl.id, { pos: pose.pos, heading: heading.current });
  });

  const pick = useMemo(() => pickHandlers(() => ({ kind: 'forklift', id: fl.id })), [fl.id]);
  return (
    <group ref={ref} name={`forklift:${fl.id}`} {...pick}>
      <mesh geometry={geo.body} material={paint} position={[0, 0.75, -0.1]} castShadow />
      <mesh geometry={geo.counterweight} material={paint} position={[0, 0.65, -1.3]} castShadow />
      <mesh geometry={geo.seat} material={black} position={[0, 1.37, -0.35]} />
      {[[-0.55, -0.85], [0.55, -0.85], [-0.55, 0.3], [0.55, 0.3]].map(([x, z]) => (
        <mesh key={`${x}${z}`} geometry={geo.guardPost} material={black} position={[x!, 1.95, z!]} />
      ))}
      <mesh geometry={geo.guardTop} material={black} position={[0, 2.72, -0.28]} castShadow />
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} geometry={geo.mastPost} material={black} position={[x, 1.4, 0.98]} castShadow />
      ))}
      <mesh geometry={geo.mastBar} material={black} position={[0, 2.6, 0.98]} />
      <group ref={forks}>
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} geometry={geo.fork} material={black} position={[x, FORKS[1] - 0.2, FORKS[2] - 0.2]} />
        ))}
      </group>
      {[[-0.62, 0.65], [0.62, 0.65], [-0.62, -0.95], [0.62, -0.95]].map(([x, z]) => (
        <mesh key={`w${x}${z}`} geometry={geo.wheel} material={black} position={[x!, 0.32, z!]} />
      ))}
    </group>
  );
}

export function Forklifts({ siteId }: { siteId: string }) {
  const world = useSim((s) => s.world);
  const fleet = [...world.forklifts.values()].filter((f) => f.siteId === siteId);
  return (
    <group name="forklifts">
      {fleet.map((f, i) => (
        <ForkliftModel key={f.id} fl={f} index={i} />
      ))}
    </group>
  );
}
