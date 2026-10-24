import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, ConeGeometry, InstancedMesh, MeshLambertMaterial, Object3D, SphereGeometry } from 'three';
import { color } from '../design/colors';
import { useSim } from '../store/sim';
import { hasPin, palletPlacement } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

export const PALLET_CAPACITY = 64;
const PIN_CAPACITY = 32;

/** Load colour by goods category: brown cartons, blue plastic crates (spec 5.2), pale stretch-wrap. */
const LOAD_COLOR: Record<string, string> = {
  Packaging: '#c89b6d',
  PPE: '#4a86e8',
  Electrical: '#e9edf5',
  Frozen: '#dfeaf3',
  Beverage: '#a9c8e8',
  Furniture: '#b88a62',
};
const DEFAULT_LOAD = '#c89b6d';

const baseGeo = new BoxGeometry(1.2, 0.16, 1.0).translate(0, 0.08, 0);
const loadGeo = new BoxGeometry(1.1, 0.95, 0.92).translate(0, 0.16 + 0.475, 0);
const baseMat = new MeshLambertMaterial({ color: '#a97b52', flatShading: true });
const loadMat = new MeshLambertMaterial({ color: '#ffffff', flatShading: true });
// Locator pin: a blue drop, sphere on a downward cone (spec 5.2 "giọt nước xanh").
const pinHeadGeo = new SphereGeometry(0.55, 12, 8);
const pinTipGeo = new ConeGeometry(0.45, 1.0, 12).rotateX(Math.PI).translate(0, -0.65, 0);
const pinMat = new MeshLambertMaterial({ color: color.accent, emissive: color.accent, emissiveIntensity: 0.25 });
const PIN_LIFT = 3.0;

/** Every visible pallet of the viewed site in one draw call per part (spec 9). */
export function Pallets({ siteId }: { siteId: string }) {
  const bases = useRef<InstancedMesh>(null);
  const loads = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);
  const tips = useRef<InstancedMesh>(null);
  const o = useMemo(() => new Object3D(), []);
  const colors = useMemo(() => new Map<string, Color>(), []);
  const colorOf = (category: string) => {
    let c = colors.get(category);
    if (!c) colors.set(category, (c = new Color(LOAD_COLOR[category] ?? DEFAULT_LOAD)));
    return c;
  };

  // Instanced meshes: the hit's instanceId indexes this frame's id list.
  const pickPallet = useMemo(
    () => pickHandlers((e) => (e.instanceId === undefined ? null : { kind: 'pallet', id: renderPoses.palletIds[e.instanceId]! })),
    [],
  );
  const pickPin = useMemo(
    () => pickHandlers((e) => (e.instanceId === undefined ? null : { kind: 'pallet', id: renderPoses.pinIds[e.instanceId]! })),
    [],
  );

  // instanceColor must exist before the shader compiles, or per-instance colour is ignored.
  useLayoutEffect(() => {
    const white = new Color('#ffffff');
    for (let i = 0; i < PALLET_CAPACITY; i++) loads.current!.setColorAt(i, white);
    loads.current!.count = 0;
  }, []);

  useFrame(({ clock: three }) => {
    const { world } = useSim.getState();
    const site = world.sites.find((s) => s.id === siteId);
    if (!site || !bases.current || !loads.current || !heads.current || !tips.current) return;
    renderPoses.pallets.clear();
    let n = 0;
    let k = 0;
    for (const p of world.pallets.values()) {
      if (n >= PALLET_CAPACITY) break;
      const at = palletPlacement(site, p, renderPoses.forklifts);
      if (!at) continue;
      o.position.set(...at.pos);
      o.rotation.set(0, at.heading, 0);
      o.updateMatrix();
      bases.current.setMatrixAt(n, o.matrix);
      loads.current.setMatrixAt(n, o.matrix);
      loads.current.setColorAt(n, colorOf(p.category));
      renderPoses.palletIds[n] = p.id;
      renderPoses.pallets.set(p.id, at.pos);
      n++;

      if (hasPin(p) && k < PIN_CAPACITY) {
        const bob = Math.sin(three.elapsedTime * 2 + n) * 0.12;
        o.position.set(at.pos[0], at.pos[1] + PIN_LIFT + bob, at.pos[2]);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        heads.current.setMatrixAt(k, o.matrix);
        tips.current.setMatrixAt(k, o.matrix);
        renderPoses.pinIds[k] = p.id;
        k++;
      }
    }
    for (const [mesh, count] of [[bases.current, n], [loads.current, n], [heads.current, k], [tips.current, k]] as const) {
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.boundingSphere = null; // instances move every frame; let raycasts recompute bounds
    }
    if (loads.current.instanceColor) loads.current.instanceColor.needsUpdate = true;
    renderPoses.counts.pallets = n;
    renderPoses.counts.pins = k;
  });

  return (
    <group name="pallets">
      <instancedMesh name="pallet-bases" ref={bases} args={[baseGeo, baseMat, PALLET_CAPACITY]} frustumCulled={false} castShadow {...pickPallet} />
      <instancedMesh name="pallet-loads" ref={loads} args={[loadGeo, loadMat, PALLET_CAPACITY]} frustumCulled={false} castShadow {...pickPallet} />
      <instancedMesh name="pin-heads" ref={heads} args={[pinHeadGeo, pinMat, PIN_CAPACITY]} frustumCulled={false} {...pickPin} />
      <instancedMesh name="pin-tips" ref={tips} args={[pinTipGeo, pinMat, PIN_CAPACITY]} frustumCulled={false} {...pickPin} />
    </group>
  );
}
