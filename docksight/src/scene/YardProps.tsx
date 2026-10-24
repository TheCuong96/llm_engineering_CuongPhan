// Static yard props (spec 5.2): blue pallet racking full of cartons, forklift chargers with
// painted parking spots, striped shipping containers. All repeated parts are instanced.

import { useMemo } from 'react';
import { BoxGeometry, MeshLambertMaterial } from 'three';
import { color } from '../design/colors';
import { RACK_ROWS_X, RACK_Z } from '../sim/layout';
import { createRng } from '../sim/rng';
import type { Site } from '../sim/types';
import { Instanced, type Placement } from './Instanced';
import { layoutOf } from './layouts';
import { mat } from './palette';

const unitBox = new BoxGeometry(1, 1, 1);
const rackBlue = new MeshLambertMaterial({ color: '#2f63d6', flatShading: true });
const carton = new MeshLambertMaterial({ color: '#c89b6d', flatShading: true });
const chargerBody = new MeshLambertMaterial({ color: '#ffffff', flatShading: true });
const screen = new MeshLambertMaterial({ color: color.accent, emissive: color.accent, emissiveIntensity: 0.3 });
const containerTeal = new MeshLambertMaterial({ color: '#2aa7a0', flatShading: true });
const containerBlue = new MeshLambertMaterial({ color: '#3a6fd8', flatShading: true });

const BAY = 2.6; // rack bay width along z
const LEVELS = [0.15, 1.75, 3.35];
const RACK_DEPTH = 1.3;
const RACK_HEIGHT = 4.8;

function Racks({ seed }: { seed: number }) {
  const { uprights, beams, cartons } = useMemo(() => {
    const rng = createRng(seed);
    const uprights: Placement[] = [];
    const beams: Placement[] = [];
    const cartons: Placement[] = [];
    const [z0, z1] = RACK_Z;
    const bays = Math.floor((z1 - z0) / BAY);
    for (const x of RACK_ROWS_X) {
      for (let i = 0; i <= bays; i++) {
        for (const dx of [-RACK_DEPTH / 2, RACK_DEPTH / 2]) {
          uprights.push({ pos: [x + dx, RACK_HEIGHT / 2, z0 + i * BAY], scale: [0.12, RACK_HEIGHT, 0.12] });
        }
      }
      for (const y of LEVELS) {
        for (const dx of [-RACK_DEPTH / 2, RACK_DEPTH / 2]) {
          beams.push({ pos: [x + dx, y + 1.25, (z0 + z0 + bays * BAY) / 2], scale: [0.1, 0.14, bays * BAY] });
        }
        for (let i = 0; i < bays; i++) {
          if (rng.next() < 0.18) continue; // a few empty slots so it reads as live stock
          const h = rng.range(0.85, 1.15);
          cartons.push({ pos: [x, y + h / 2 + 0.05, z0 + (i + 0.5) * BAY], scale: [1.05, h, 2.1] });
        }
      }
    }
    return { uprights, beams, cartons };
  }, [seed]);
  return (
    <group>
      <Instanced name="rack-uprights" geometry={unitBox} material={rackBlue} placements={uprights} />
      <Instanced name="rack-beams" geometry={unitBox} material={rackBlue} placements={beams} castShadow={false} />
      <Instanced name="rack-cartons" geometry={unitBox} material={carton} placements={cartons} />
    </group>
  );
}

/** Small white charger boxes beside a painted forklift spot each (C1, C2, C3). */
function Chargers({ site }: { site: Site }) {
  const { bodies, screens, lines } = useMemo(() => {
    const bodies: Placement[] = [];
    const screens: Placement[] = [];
    const lines: Placement[] = [];
    for (const c of site.chargers) {
      const [x, , z] = c.pos.map((v, i) => v - site.worldPos[i]!) as [number, number, number];
      bodies.push({ pos: [x + 2.2, 0.75, z], scale: [0.7, 1.5, 1.0] });
      screens.push({ pos: [x + 1.83, 1.15, z], scale: [0.04, 0.35, 0.55] });
      // Painted spot the forklift parks in while charging.
      for (const dz of [-1.5, 1.5]) lines.push({ pos: [x, 0.02, z + dz], scale: [3.2, 0.02, 0.12] });
      lines.push({ pos: [x - 1.6, 0.02, z], scale: [0.12, 0.02, 3.1] });
    }
    return { bodies, screens, lines };
  }, [site]);
  return (
    <group>
      <Instanced name="charger-bodies" geometry={unitBox} material={chargerBody} placements={bodies} />
      <Instanced name="charger-screens" geometry={unitBox} material={screen} placements={screens} castShadow={false} />
      <Instanced name="charger-spots" geometry={unitBox} material={mat.paint} placements={lines} castShadow={false} />
    </group>
  );
}

const CONTAINER = { len: 12, w: 2.5, h: 2.6 };

const CONTAINER_SPOTS: { pos: [number, number, number]; teal: boolean }[] = [
  { pos: [50, 0, -27], teal: true },
  { pos: [50, 0, -23.6], teal: false },
  { pos: [50, CONTAINER.h, -25.3], teal: true }, // stacked on the pair below
];
const containerRibs: Placement[] = CONTAINER_SPOTS.flatMap((s) => {
  const out: Placement[] = [];
  for (let dx = -CONTAINER.len / 2 + 0.5; dx < CONTAINER.len / 2; dx += 0.75) {
    out.push({ pos: [s.pos[0] + dx, s.pos[1] + CONTAINER.h / 2, s.pos[2]], scale: [0.18, CONTAINER.h - 0.1, CONTAINER.w + 0.08] });
  }
  return out;
});

/** Ribbed shipping containers parked on the east side of the yard. */
function Containers() {
  return (
    <group>
      {CONTAINER_SPOTS.map((s) => (
        <mesh
          key={s.pos.join()}
          geometry={unitBox}
          material={s.teal ? containerTeal : containerBlue}
          position={[s.pos[0], s.pos[1] + CONTAINER.h / 2, s.pos[2]]}
          scale={[CONTAINER.len, CONTAINER.h, CONTAINER.w]}
          castShadow
          receiveShadow
        />
      ))}
      <Instanced name="container-ribs" geometry={unitBox} material={mat.wallRib} placements={containerRibs} castShadow={false} />
    </group>
  );
}

export function YardProps({ site, visible = true }: { site: Site; visible?: boolean }) {
  const seed = Number(site.id.replace(/\D/g, '')) * 104729;
  const L = layoutOf(site.layout);
  return (
    <group name={`yard-props:${site.id}`} position={site.worldPos} visible={visible}>
      {L.racks && <Racks seed={seed} />}
      <Chargers site={site} />
      {L.containers && <Containers />}
    </group>
  );
}
