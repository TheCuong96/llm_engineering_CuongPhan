import { Select } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, DoubleSide, InstancedMesh, MeshBasicMaterial, MeshLambertMaterial, Object3D, PlaneGeometry } from 'three';
import { useSim } from '../store/sim';
import { chestPlacement, chestVariant, isImportant, type ChestVariant } from './entityPose';
import { pickHandlers } from './picking';
import { renderPoses } from './renderPoses';

export const CHEST_CAPACITY = 160;
const TALISMAN_CAPACITY = 48;

const VARIANT_COLOR: Record<ChestVariant, string> = {
  wood: '#8A5E3C', // brown wood, bronze bands
  jade: '#5E9C88', // jade chest for precious herbs
  frost: '#E8EEF4', // frosted chest for cold-chain goods
};

const bodyGeo = new BoxGeometry(0.95, 0.62, 0.62).translate(0, 0.31, 0);
const bandGeo = new BoxGeometry(0.99, 0.12, 0.66).translate(0, 0.42, 0);
const bodyMat = new MeshLambertMaterial({ color: '#ffffff', flatShading: true });
const bandMat = new MeshLambertMaterial({ color: '#A57C3A', flatShading: true });
const talismanGeo = new PlaneGeometry(0.42, 0.75);
const talismanMat = new MeshBasicMaterial({ color: '#E9C85A', side: DoubleSide });

/**
 * Every tracked chest of the viewed peak in one draw call (spec §5.2): yard, vault door,
 * on a shoulder, stacked on deck. Plus a floating talisman over the important ones.
 */
export function Chests({ peakId }: { peakId: string }) {
  const bodies = useRef<InstancedMesh>(null);
  const bands = useRef<InstancedMesh>(null);
  const talismans = useRef<InstancedMesh>(null);
  const colors = useMemo(() => {
    const m = new Map<ChestVariant, Color>();
    for (const [k, v] of Object.entries(VARIANT_COLOR)) m.set(k as ChestVariant, new Color(v));
    return m;
  }, []);
  const o = useMemo(() => new Object3D(), []);
  const pickChest = useMemo(
    () => pickHandlers((e) => (e.instanceId === undefined ? null : { kind: 'chest', id: renderPoses.chestIds[e.instanceId]! })),
    [],
  );
  const pickTalisman = useMemo(
    () => pickHandlers((e) => (e.instanceId === undefined ? null : { kind: 'chest', id: renderPoses.talismanIds[e.instanceId]! })),
    [],
  );

  // instanceColor must exist before the shader compiles, or per-instance colour is ignored.
  useLayoutEffect(() => {
    const white = new Color('#ffffff');
    for (let i = 0; i < CHEST_CAPACITY; i++) bodies.current!.setColorAt(i, white);
    bodies.current!.count = 0;
  }, []);

  useFrame(({ clock: three }) => {
    const { world } = useSim.getState();
    const peak = world.peaks.find((p) => p.id === peakId);
    if (!peak || !bodies.current || !bands.current || !talismans.current) return;
    const deck = new Map<string, number>();
    renderPoses.chests.clear();
    let n = 0;
    let k = 0;
    for (const c of world.chests.values()) {
      if (n >= CHEST_CAPACITY) break;
      const ref = c.location.ref;
      const deckIndex = c.location.kind === 'ship' ? (deck.get(ref) ?? 0) : 0;
      const at = chestPlacement(world, peak, c, renderPoses.workers, renderPoses.ships, deckIndex);
      if (!at) continue;
      if (c.location.kind === 'ship') deck.set(ref, deckIndex + 1);

      o.position.set(at.pos[0], at.pos[1], at.pos[2]);
      o.rotation.set(0, at.heading, 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      bodies.current.setMatrixAt(n, o.matrix);
      bands.current.setMatrixAt(n, o.matrix);
      bodies.current.setColorAt(n, colors.get(chestVariant(c))!);
      renderPoses.chestIds[n] = c.id;
      renderPoses.chests.set(c.id, at.pos);
      n++;

      if (isImportant(c) && k < TALISMAN_CAPACITY) {
        const t = three.elapsedTime;
        o.position.set(at.pos[0], at.pos[1] + 1.6 + Math.sin(t * 1.5 + n) * 0.12, at.pos[2]);
        o.rotation.set(0, t * 0.8 + n, 0);
        o.updateMatrix();
        renderPoses.talismanIds[k] = c.id;
        talismans.current.setMatrixAt(k++, o.matrix);
      }
    }
    for (const mesh of [bodies.current, bands.current, talismans.current]) {
      mesh.count = mesh === talismans.current ? k : n;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.boundingSphere = null; // instances move every frame; let raycasts recompute bounds
    }
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true;
    talismans.current.count = k;
    renderPoses.counts.chests = n;
    renderPoses.counts.talismans = k;
    talismans.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="chests">
      <instancedMesh name="chest-bodies" ref={bodies} args={[bodyGeo, bodyMat, CHEST_CAPACITY]} frustumCulled={false} castShadow {...pickChest} />
      <instancedMesh name="chest-bands" ref={bands} args={[bandGeo, bandMat, CHEST_CAPACITY]} frustumCulled={false} />
      <Select enabled>
      <instancedMesh name="talismans" ref={talismans} args={[talismanGeo, talismanMat, TALISMAN_CAPACITY]} frustumCulled={false} {...pickTalisman} />
      </Select>
    </group>
  );
}
