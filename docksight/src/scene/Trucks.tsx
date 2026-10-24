import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BoxGeometry, Color, CylinderGeometry, Group, MeshLambertMaterial } from 'three';
import { TICK_DT } from '../sim/clock';
import { TRUCK_LENGTH } from '../sim/layout';
import type { Carrier, Truck } from '../sim/types';
import { useSim } from '../store/sim';
import { truckPose } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

// Shared by every truck: trucks come and go all the time, and per-mount geometry would churn
// GPU buffers (P6 memory criterion). The model faces +Z with its origin at the truck centre.
const L = TRUCK_LENGTH;
const TRAILER = { len: 9.6, w: 2.5, h: 3.1, floor: 1.15 };
const CAB = { len: 2.7, w: 2.4, h: 2.7, floor: 0.75 };
const geo = {
  trailer: new BoxGeometry(TRAILER.w, TRAILER.h, TRAILER.len),
  stripe: new BoxGeometry(TRAILER.w + 0.04, 0.45, TRAILER.len - 0.6),
  cab: new BoxGeometry(CAB.w, CAB.h, CAB.len),
  roof: new BoxGeometry(CAB.w - 0.2, 0.5, 1.6),
  glass: new BoxGeometry(CAB.w - 0.3, 0.9, 0.05),
  chassis: new BoxGeometry(1.6, 0.4, L - 0.6),
  wheel: new CylinderGeometry(0.5, 0.5, 0.42, 10).rotateZ(Math.PI / 2),
  rearDoors: new BoxGeometry(TRAILER.w - 0.2, TRAILER.h - 0.3, 0.05),
};
const trailerZ = -L / 2 + TRAILER.len / 2;
const cabZ = L / 2 - CAB.len / 2;
const axlesZ = [-L / 2 + 1.1, -L / 2 + 2.3, L / 2 - 1.2, L / 2 - 4.2];

const dark = new MeshLambertMaterial({ color: '#2a3048', flatShading: true });
const glass = new MeshLambertMaterial({ color: '#33416b', flatShading: true });
const doorSeam = new MeshLambertMaterial({ color: '#d9deec', flatShading: true });

function liveryMaterials(c: Carrier) {
  const m = (hex: string) => new MeshLambertMaterial({ color: new Color(hex), flatShading: true });
  return { cab: m(c.livery.cab), trailer: m(c.livery.trailer), stripe: m(c.livery.stripe ?? c.livery.cab) };
}
type Livery = ReturnType<typeof liveryMaterials>;

/** Tractor + box trailer in the carrier's livery (spec 5.2). */
function TruckModel({ truck, livery }: { truck: Truck; livery: Livery }) {
  const ref = useRef<Group>(null);
  const heading = useRef(Math.PI / 2);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const { world, clock } = useSim.getState();
    const pose = truckPose(truck, world.t + clock.alpha * TICK_DT);
    if (pose.heading !== undefined) heading.current = pose.heading;
    g.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
    g.rotation.y = heading.current;
    renderPoses.trucks.set(truck.id, { pos: pose.pos, heading: heading.current });
  });

  const pick = useMemo(() => pickHandlers(() => ({ kind: 'truck', id: truck.id })), [truck.id]);
  return (
    <group ref={ref} name={`truck:${truck.id}`} {...pick}>
      <mesh geometry={geo.trailer} material={livery.trailer} position={[0, TRAILER.floor + TRAILER.h / 2, trailerZ]} castShadow />
      {/* One box a hair wider than the trailer shows the livery stripe on both sides. */}
      <mesh geometry={geo.stripe} material={livery.stripe} position={[0, TRAILER.floor + 1.1, trailerZ]} />
      <mesh geometry={geo.rearDoors} material={doorSeam} position={[0, TRAILER.floor + TRAILER.h / 2, -L / 2 - 0.03]} />
      <mesh geometry={geo.cab} material={livery.cab} position={[0, CAB.floor + CAB.h / 2, cabZ]} castShadow />
      <mesh geometry={geo.roof} material={livery.stripe} position={[0, CAB.floor + CAB.h + 0.25, cabZ - 0.4]} />
      <mesh geometry={geo.glass} material={glass} position={[0, CAB.floor + CAB.h - 0.75, L / 2 + 0.03]} />
      <mesh geometry={geo.chassis} material={dark} position={[0, 0.75, 0]} />
      {axlesZ.flatMap((z) =>
        [-1, 1].map((side) => <mesh key={`${z}${side}`} geometry={geo.wheel} material={dark} position={[side * 1.05, 0.5, z]} />),
      )}
    </group>
  );
}

/** Hides a truck while it is off this site's map (in transit / delivered) without re-keying. */
function TruckSlot({ truck, livery }: { truck: Truck; livery: Livery }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const onMap = truck.siteId !== null;
    if (ref.current) ref.current.visible = onMap;
    if (!onMap) renderPoses.trucks.delete(truck.id);
  });
  return (
    <group ref={ref}>
      <TruckModel truck={truck} livery={livery} />
    </group>
  );
}

/** Every truck assigned to the viewed site. */
export function Trucks({ siteId }: { siteId: string }) {
  const world = useSim((s) => s.world);
  useSim((s) => s.roster); // re-render when trucks spawn or leave
  const liveries = useMemo(() => new Map(world.carriers.map((c) => [c.id, liveryMaterials(c)])), [world]);
  const trucks = [...world.trucks.values()].filter((t) => t.homeSiteId === siteId);
  for (const id of renderPoses.trucks.keys()) if (!world.trucks.has(id)) renderPoses.trucks.delete(id);
  return (
    <group name="trucks">
      {trucks.map((t) => (
        <TruckSlot key={t.id} truck={t} livery={liveries.get(t.carrierId)!} />
      ))}
    </group>
  );
}
