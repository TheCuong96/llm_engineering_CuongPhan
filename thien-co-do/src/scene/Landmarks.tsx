// What makes each peak recognisable (spec §7.1 "Nét riêng của scene"). Peak-local coordinates,
// kept clear of the yard (x 0–15, z −16…−6), home (−8, 2), arrays and the pad edge (+X).

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Group, IcosahedronGeometry, InstancedMesh, MeshBasicMaterial, Object3D, OctahedronGeometry } from 'three';
import { color } from '../design/tokens';
import type { PeakKind } from '../sim/types';
import { createRng } from '../sim/rng';
import { effects, useQuality } from '../store/quality';
import { mat, sceneColor } from './palette';

const smokeGeo = new IcosahedronGeometry(0.6, 0);
const smokeMat = new MeshBasicMaterial({ color: sceneColor.smoke, transparent: true, opacity: 0.55, depthWrite: false });
const crystalGeo = new OctahedronGeometry(1, 0);
export const SMOKE_PER_FURNACE = 14;

/** Đan Hà Phong: three tripod cauldrons with rose smoke curling up (instanced). */
function Furnaces() {
  // On the open plaza: clear of the yard, the idle spot (−8, 2), both arrays and the vault→pad walk.
  const spots: [number, number][] = [[-14, 11], [3, 9], [15, 3]];
  const smoke = useRef<InstancedMesh>(null);
  const o = useMemo(() => new Object3D(), []);
  const particles = useQuality((q) => effects(q.level).particles);
  useFrame(({ clock }) => {
    const m = smoke.current;
    if (!m) return;
    m.visible = particles;
    if (!particles) return;
    let n = 0;
    spots.forEach(([x, z], f) => {
      for (let k = 0; k < SMOKE_PER_FURNACE; k++) {
        const ph = (clock.elapsedTime * 0.18 + k / SMOKE_PER_FURNACE + f * 0.3) % 1;
        o.position.set(x + Math.sin(ph * 6 + k) * 0.6 * ph, 3 + ph * 7, z + Math.cos(ph * 5 + k) * 0.6 * ph);
        o.scale.setScalar(0.6 + ph * 1.6);
        o.updateMatrix();
        m.setMatrixAt(n++, o.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group name="landmark:furnaces">
      {spots.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, 0, z]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} material={mat.bronze} position={[Math.cos((i * 2 * Math.PI) / 3) * 1, 0.6, Math.sin((i * 2 * Math.PI) / 3) * 1]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 1.2, 5]} />
            </mesh>
          ))}
          <mesh material={mat.bronze} position={[0, 1.8, 0]} castShadow>
            <sphereGeometry args={[1.3, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
          <mesh material={mat.bronze} position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.12, 4, 10]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={smoke} args={[smokeGeo, smokeMat, spots.length * SMOKE_PER_FURNACE]} frustumCulled={false} />
    </group>
  );
}

/** Hàn Băng Cốc: an ice cave cut into a rock mound, crystal clusters and a frozen fall over the rim. */
function IceCave() {
  const crystals = useRef<InstancedMesh>(null);
  const count = 18;
  useLayoutEffect(() => {
    const rng = createRng(31);
    const o = new Object3D();
    for (let i = 0; i < count; i++) {
      const a = rng.range(-1.2, 1.2);
      const r = rng.range(8, 13);
      o.position.set(-6 + Math.cos(a + Math.PI) * r * 0.4, rng.range(0.2, 1), -24 + Math.sin(a) * r * 0.5);
      o.rotation.set(rng.range(-0.3, 0.3), rng.range(0, 3), rng.range(-0.3, 0.3));
      o.scale.set(rng.range(0.4, 0.8), rng.range(1.2, 2.6), rng.range(0.4, 0.8));
      o.updateMatrix();
      crystals.current!.setMatrixAt(i, o.matrix);
    }
    crystals.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group name="landmark:ice-cave">
      <mesh material={mat.stone} position={[-6, 0, -26]} scale={[9, 6, 6]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={mat.door} position={[-6, 1.8, -20.6]} rotation={[0, 0, 0]}>
        <circleGeometry args={[2.4, 10, 0, Math.PI]} />
      </mesh>
      <instancedMesh ref={crystals} args={[crystalGeo, mat.ice, count]} castShadow />
      {/* frozen waterfall spilling over the north rim */}
      <mesh material={mat.ice} position={[-30, -9, -14]} rotation={[0, 0.5, 0.06]}>
        <boxGeometry args={[1.2, 20, 5]} />
      </mesh>
    </group>
  );
}

/** Truyền Tống Đài: a large teleport circle laid into the plaza. */
function TeleportCircle() {
  const ring = useMemo(() => new MeshBasicMaterial({ color: color.accent, transparent: true, opacity: 0.35, depthWrite: false }), []);
  const g = useRef<Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += dt * 0.08;
  });
  return (
    <group name="landmark:teleport" position={[2, 0.08, 6]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh material={mat.stone}>
        <circleGeometry args={[7.5, 16]} />
      </mesh>
      <group ref={g} position={[0, 0, 0.02]}>
        {[[6.6, 7], [4.4, 4.7], [2, 2.25]].map(([a, b]) => (
          <mesh key={a} material={ring}>
            <ringGeometry args={[a!, b!, 16]} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} material={ring} rotation={[0, 0, (i * Math.PI) / 4]} position={[Math.cos((i * Math.PI) / 4) * 5.5, Math.sin((i * Math.PI) / 4) * 5.5, 0]}>
            <planeGeometry args={[0.2, 1.4]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Khôi Lỗi Phong: two great brass gears behind the hall, turning against each other. */
function Gears() {
  const a = useRef<Group>(null);
  const b = useRef<Group>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.25;
    if (b.current) b.current.rotation.z -= dt * 0.35;
  });
  const gear = (r: number, teeth: number) => (
    <>
      <mesh material={mat.brass} castShadow>
        <torusGeometry args={[r, r * 0.16, 5, teeth * 2]} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => (
        <mesh key={i} material={mat.brass} rotation={[0, 0, (i * 2 * Math.PI) / teeth]} position={[Math.cos((i * 2 * Math.PI) / teeth) * r * 1.18, Math.sin((i * 2 * Math.PI) / teeth) * r * 1.18, 0]}>
          <boxGeometry args={[r * 0.28, r * 0.22, r * 0.3]} />
        </mesh>
      ))}
      <mesh material={mat.bronze} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.25, r * 0.25, r * 0.4, 8]} />
      </mesh>
    </>
  );
  return (
    <group name="landmark:gears" position={[-6, 0, -26]}>
      <group ref={a} position={[0, 7.5, 0]}>
        {gear(5, 12)}
      </group>
      <group ref={b} position={[8.4, 5, 0.6]}>
        {gear(3.2, 9)}
      </group>
    </group>
  );
}

export function Landmarks({ kind }: { kind: PeakKind }) {
  switch (kind) {
    case 'alchemy':
      return <Furnaces />;
    case 'cold_vault':
      return <IceCave />;
    case 'transfer':
      return <TeleportCircle />;
    case 'automaton':
      return <Gears />;
    default:
      return null;
  }
}
