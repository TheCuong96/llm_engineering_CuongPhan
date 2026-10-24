// Static diorama of one site (spec 5.2): yard, access road, fence, trees, the warehouse.
// Every anchor comes from the engine's layout, so docks and bay lines sit exactly where
// the simulation parks trucks.

import { useMemo } from 'react';
import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, IcosahedronGeometry, PlaneGeometry, Shape } from 'three';
import { add, type Vec3 } from '../sim/geometry';
import { DOCK_DEPTH, ROAD_Z } from '../sim/layout';
import { createRng } from '../sim/rng';
import type { Site } from '../sim/types';
import { Instanced, type Placement } from './Instanced';
import { mat } from './palette';

// Local frame (see sim/layout.ts): warehouse front wall on z = 0 facing +z.
export const WAREHOUSE = { x0: -35, x1: 35, z0: -30, z1: 0, height: 10 };
const YARD = { x0: -58, x1: 58, z0: -36, z1: 29 };
const GATE_GAP = { x0: -56, x1: -44 };
const ROAD_HALF_WIDTH = 4;

const unitBox = new BoxGeometry(1, 1, 1);
const plane = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const post = new CylinderGeometry(0.09, 0.09, 1.6, 6).translate(0, 0.8, 0);
const canopy = new IcosahedronGeometry(1, 0);
const trunk = new CylinderGeometry(0.18, 0.24, 1.2, 6).translate(0, 0.6, 0);

/** Flat slab lying on the ground, centred between two corners. */
function Slab({ from, to, y, material, name }: { from: [number, number]; to: [number, number]; y: number; material: typeof mat.yard; name?: string }) {
  const [x0, z0] = from;
  const [x1, z1] = to;
  return (
    <mesh name={name} geometry={plane} material={material} position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} scale={[x1 - x0, 1, z1 - z0]} receiveShadow />
  );
}

function Grounds() {
  return (
    <group>
      <Slab name="ground" from={[-600, -600]} to={[600, 600]} y={-0.02} material={mat.ground} />
      <Slab from={[-300, ROAD_Z + ROAD_HALF_WIDTH]} to={[300, ROAD_Z + ROAD_HALF_WIDTH + 3]} y={-0.01} material={mat.grass} />
      <Slab from={[-300, YARD.z1]} to={[300, ROAD_Z - ROAD_HALF_WIDTH]} y={-0.01} material={mat.grass} />
      <Slab from={[YARD.x0, YARD.z0]} to={[YARD.x1, YARD.z1]} y={0} material={mat.yard} />
      <Slab name="road" from={[-300, ROAD_Z - ROAD_HALF_WIDTH]} to={[300, ROAD_Z + ROAD_HALF_WIDTH]} y={0.01} material={mat.road} />
      {/* Driveway from the road through the gate gap into the yard. */}
      <Slab from={[GATE_GAP.x0, YARD.z1 - 0.5]} to={[GATE_GAP.x1, ROAD_Z - ROAD_HALF_WIDTH]} y={0.01} material={mat.road} />
    </group>
  );
}

function RoadMarkings() {
  const dashes = useMemo<Placement[]>(
    () => Array.from({ length: 100 }, (_, i) => ({ pos: [-297 + i * 6, 0.02, ROAD_Z], scale: [3, 0.02, 0.25] })),
    [],
  );
  return <Instanced name="road-dashes" geometry={unitBox} material={mat.roadLine} placements={dashes} castShadow={false} />;
}

function BayLines({ site }: { site: Site }) {
  const lines = useMemo<Placement[]>(() => {
    const out: Placement[] = [];
    for (const d of site.docks) {
      const x = d.pos[0] - site.worldPos[0];
      for (const dx of [-2.4, 2.4]) out.push({ pos: [x + dx, 0.02, DOCK_DEPTH / 2 + 2], scale: [0.18, 0.02, DOCK_DEPTH + 2] });
      out.push({ pos: [x, 0.02, DOCK_DEPTH + 3.2], scale: [4.98, 0.02, 0.18] });
    }
    return out;
  }, [site]);
  return <Instanced name="bay-lines" geometry={unitBox} material={mat.paint} placements={lines} castShadow={false} />;
}

function Fence() {
  const { posts, panels } = useMemo(() => {
    const posts: Placement[] = [];
    const panels: Placement[] = [];
    const run = (a: [number, number], b: [number, number]) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.round(len / 4));
      const rotY = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        posts.push({ pos: [a[0] + (b[0] - a[0]) * k, 0, a[1] + (b[1] - a[1]) * k] });
      }
      panels.push({ pos: [(a[0] + b[0]) / 2, 0.8, (a[1] + b[1]) / 2], scale: [len, 1.5, 0.04], rotY });
    };
    const { x0, x1, z0, z1 } = YARD;
    run([x0, z1], [GATE_GAP.x0, z1]);
    run([GATE_GAP.x1, z1], [x1, z1]);
    run([x1, z1], [x1, z0]);
    run([x1, z0], [x0, z0]);
    run([x0, z0], [x0, z1]);
    return { posts, panels };
  }, []);
  return (
    <group>
      <Instanced name="fence-posts" geometry={post} material={mat.fencePost} placements={posts} />
      <Instanced name="fence-panels" geometry={unitBox} material={mat.fencePanel} placements={panels} castShadow={false} />
    </group>
  );
}

/** Round trees in two sizes outside the fence, scattered from a fixed seed so every visit matches. */
function Trees({ seed }: { seed: number }) {
  const { light, dark, trunks } = useMemo(() => {
    const rng = createRng(seed);
    const light: Placement[] = [];
    const dark: Placement[] = [];
    const trunks: Placement[] = [];
    const inside = (x: number, z: number) =>
      (x > YARD.x0 - 3 && x < YARD.x1 + 3 && z > YARD.z0 - 3 && z < ROAD_Z + ROAD_HALF_WIDTH + 3) ||
      (z > ROAD_Z - ROAD_HALF_WIDTH - 2 && z < ROAD_Z + ROAD_HALF_WIDTH + 2);
    for (let tries = 0; light.length + dark.length < 90 && tries < 2000; tries++) {
      const x = rng.range(-140, 140);
      const z = rng.range(-110, 110);
      if (inside(x, z)) continue;
      const big = rng.next() < 0.45;
      const r = big ? rng.range(2.4, 3.1) : rng.range(1.4, 1.9);
      (big ? dark : light).push({ pos: [x, 1.1 + r * 0.8, z], scale: [r, r * 1.05, r], rotY: rng.range(0, Math.PI) });
      trunks.push({ pos: [x, 0, z], scale: [1, big ? 1.4 : 1, 1] });
    }
    return { light, dark, trunks };
  }, [seed]);
  return (
    <group>
      <Instanced name="trees-small" geometry={canopy} material={mat.treeLight} placements={light} />
      <Instanced name="trees-large" geometry={canopy} material={mat.treeDark} placements={dark} />
      <Instanced name="tree-trunks" geometry={trunk} material={mat.trunk} placements={trunks} />
    </group>
  );
}

/** Solid triangular prism along x: no seams between roof planes and gable ends. */
function gableRoof(length: number, halfDepth: number, rise: number) {
  const s = new Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.lineTo(0, rise);
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
  g.translate(0, 0, -length / 2);
  g.rotateY(Math.PI / 2); // extrusion axis z → x
  return g;
}

/** Long shed with ribbed white walls, a low blue gable roof and dark-blue dock door frames. */
function Warehouse({ site }: { site: Site }) {
  const { x0, x1, z0, z1, height: h } = WAREHOUSE;
  const w = x1 - x0;
  const d = z1 - z0;
  const ribs = useMemo<Placement[]>(() => {
    const out: Placement[] = [];
    for (let x = x0 + 1; x < x1; x += 2) {
      out.push({ pos: [x, h / 2, z1 + 0.06], scale: [0.35, h, 0.12] });
      out.push({ pos: [x, h / 2, z0 - 0.06], scale: [0.35, h, 0.12] });
    }
    for (let z = z0 + 1; z < z1; z += 2) {
      out.push({ pos: [x0 - 0.06, h / 2, z], scale: [0.12, h, 0.35] });
      out.push({ pos: [x1 + 0.06, h / 2, z], scale: [0.12, h, 0.35] });
    }
    return out;
  }, [x0, x1, z0, z1, h]);
  const doors = useMemo(() => site.docks.map((dk) => dk.pos[0] - site.worldPos[0]), [site]);
  const roof = useMemo(() => gableRoof(w + 1.6, d / 2 + 0.8, 2.6), [w, d]);
  return (
    <group>
      <mesh geometry={unitBox} material={mat.wall} position={[0, h / 2, (z0 + z1) / 2]} scale={[w, h, d]} castShadow receiveShadow />
      <Instanced name="wall-ribs" geometry={unitBox} material={mat.wallRib} placements={ribs} castShadow={false} />
      <mesh geometry={roof} material={mat.roof} position={[0, h, (z0 + z1) / 2]} castShadow />
      {doors.map((x) => (
        <group key={x} position={[x, 0, z1]}>
          <mesh geometry={unitBox} material={mat.doorFrame} position={[0, 2.6, 0.15]} scale={[4.6, 5.2, 0.3]} castShadow />
          <mesh geometry={unitBox} material={mat.doorShadow} position={[0, 2.35, 0.32]} scale={[3.8, 4.5, 0.05]} />
          <mesh geometry={unitBox} material={mat.curb} position={[0, 0.6, 0.9]} scale={[4.2, 1.2, 1.6]} receiveShadow />
        </group>
      ))}
    </group>
  );
}

export function SiteScenery({ site }: { site: Site }) {
  const origin: Vec3 = add(site.worldPos, [0, 0, 0]);
  const seed = Number(site.id.replace(/\D/g, '')) * 7919;
  return (
    <group name={`site:${site.id}`} position={origin}>
      <Grounds />
      <RoadMarkings />
      <BayLines site={site} />
      <Fence />
      <Trees seed={seed} />
      <Warehouse site={site} />
    </group>
  );
}
