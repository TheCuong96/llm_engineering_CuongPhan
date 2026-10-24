import { Select } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  ExtrudeGeometry,
  Group,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Shape,
} from 'three';
import { BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { color } from '../design/tokens';
import { TICK_DT } from '../sim/clock';
import type { Guild, Ship } from '../sim/types';
import { useSim } from '../store/sim';
import { shipPose } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

// Shared by every instance of this entity: ships and workers come and go all the time, and
// per-mount JSX geometry would churn GPU buffers (spec §12, P6 memory criterion).
const geo = {
  sail: new BoxGeometry(3.6, 3.4, 0.08),
  s0: new BoxGeometry(2, 1, 1.6),
  s1: new CylinderGeometry(0.1, 0.14, 6, 5),
  s2: new ConeGeometry(0.35, 1.6, 3),
  s3: new CircleGeometry(3.2, 16),
};


/** Hull seen from above (bow toward +Z), extruded upward; a narrower copy below forms the keel. */
function hullGeometry(): BufferGeometry {
  const outline = (k: number) => {
    const s = new Shape();
    s.moveTo(0, 5 * k);
    s.quadraticCurveTo(1.6 * k, 2.6 * k, 1.6 * k, 0);
    s.lineTo(1.4 * k, -3.6 * k);
    s.quadraticCurveTo(1.2 * k, -4.8 * k, 0, -4.8 * k);
    s.quadraticCurveTo(-1.2 * k, -4.8 * k, -1.4 * k, -3.6 * k);
    s.lineTo(-1.6 * k, 0);
    s.quadraticCurveTo(-1.6 * k, 2.6 * k, 0, 5 * k);
    return s;
  };
  // Shape lives in XY with the bow at +Y; rotateX(-90°) sends extrusion up and the bow to -Z.
  const deck = new ExtrudeGeometry(outline(1), { depth: 1.1, bevelEnabled: false, curveSegments: 3 });
  deck.rotateX(-Math.PI / 2);
  const keel = new ExtrudeGeometry(outline(0.62), { depth: 0.8, bevelEnabled: false, curveSegments: 3 });
  keel.rotateX(-Math.PI / 2).translate(0, -0.8, 0);
  // Turn the bow to +Z with a rotation (a mirror would flip winding and cull the outside).
  return mergeGeometries([deck, keel])!.rotateY(Math.PI).toNonIndexed();
}

const hull = hullGeometry();
hull.computeVertexNormals();

const glowMat = new MeshBasicMaterial({
  color: color.accent,
  transparent: true,
  opacity: 0.32,
  blending: AdditiveBlending,
  depthWrite: false,
});

function liveryMaterials(g: Guild) {
  const m = (hex: string, extra = {}) => new MeshLambertMaterial({ color: new Color(hex), flatShading: true, ...extra });
  return { hull: m(g.livery.hull), sail: m(g.livery.sail, { side: 2 }), flag: m(g.livery.flag, { side: 2 }) };
}

/** Linh chu: curved wooden hull, mast with guild-coloured sail and pennant, faint violet glow beneath. */
function SpiritShip({ ship, livery }: { ship: Ship; livery: ReturnType<typeof liveryMaterials> }) {
  const ref = useRef<Group>(null);
  const heading = useRef(0);

  useFrame(({ clock: three }) => {
    const { world, clock } = useSim.getState();
    const g = ref.current;
    if (!g) return;
    const pose = shipPose(ship, world.t + clock.alpha * TICK_DT);
    if (pose.heading !== undefined && ship.state !== 'unloading' && ship.state !== 'loading') heading.current = pose.heading;
    const bob = ship.state === 'unloading' || ship.state === 'loading' ? 0 : Math.sin(three.elapsedTime * 1.3 + ship.id.length) * 0.25;
    g.position.set(pose.pos[0], pose.pos[1] + 1.1 + bob, pose.pos[2]);
    g.rotation.y = heading.current;
    renderPoses.ships.set(ship.id, { pos: [g.position.x, g.position.y - 1.1, g.position.z], heading: heading.current });
  });

  const pick = useMemo(() => pickHandlers(() => ({ kind: 'ship', id: ship.id })), [ship.id]);
  return (
    <group ref={ref} name={`ship:${ship.id}`} {...pick}>
      <mesh geometry={hull} material={livery.hull} castShadow />
      {/* cabin at the stern */}
      <mesh geometry={geo.s0} material={livery.hull} position={[0, 1.6, -3.2]} castShadow />
      <mesh geometry={geo.s1} material={livery.hull} position={[0, 4, 0.6]} />
      {/* sail trimmed to the wind so the livery reads from the default view */}
      <mesh geometry={geo.sail} material={livery.sail} position={[0, 4.2, 0.75]} rotation={[0, 0.45, 0]} castShadow />
      <mesh geometry={geo.s2} material={livery.flag} position={[0, 7.05, 0.1]} rotation={[0, Math.PI / 2, 0]} />
      <Select enabled>
        <mesh geometry={geo.s3} material={glowMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} />
      </Select>
    </group>
  );
}

/** All ships assigned to the viewed peak that are inside the sect (not between peaks). */
export function Ships({ peakId }: { peakId: string }) {
  const world = useSim((s) => s.world);
  useSim((s) => s.roster); // re-render when ships spawn or leave
  const liveries = useMemo(() => new Map(world.guilds.map((g) => [g.id, liveryMaterials(g)])), [world]);
  const ships = [...world.ships.values()].filter((s) => s.homePeakId === peakId);
  return (
    <group name="ships">
      {ships.map((s) => (
        <ShipSlot key={s.id} ship={s} livery={liveries.get(s.guildId)!} />
      ))}
    </group>
  );
}

/** Hides a ship once it has left the sect (peakId null) without re-rendering the list. */
function ShipSlot({ ship, livery }: { ship: Ship; livery: ReturnType<typeof liveryMaterials> }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = ship.peakId !== null;
    if (ship.peakId === null) renderPoses.ships.delete(ship.id);
  });
  return (
    <group ref={ref}>
      <SpiritShip ship={ship} livery={livery} />
    </group>
  );
}
