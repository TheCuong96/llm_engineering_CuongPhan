import { ISLAND_RADIUS } from '../sim/layout';
import type { Peak } from '../sim/types';
import { domeGeometry, lodDomeMaterial } from './Barrier';
import { mat } from './palette';
import { roofGeometry, islandBaseGeometry } from './shapes';

const seedOf = (id: string) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Far peak (spec §5.1 LOD): island block, the main roof and the barrier dome only — no
 * entities, no shadows. Distance fog turns it into a soft ink-wash silhouette.
 */
export function PeakLod({ peak, visible = true }: { peak: Peak; visible?: boolean }) {
  const seed = seedOf(peak.id);
  return (
    <group name={visible ? `peak-lod:${peak.id}` : `peak-lod-hidden:${peak.id}`} visible={visible} position={peak.worldPos} rotation={[0, peak.facingRad, 0]}>
      <mesh material={peak.kind === 'cold_vault' ? mat.snow : mat.grass} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS * 0.97, 2.4, 12]} />
      </mesh>
      <mesh geometry={islandBaseGeometry(ISLAND_RADIUS * 0.97, 34, seed)} material={mat.stone} position={[0, -2.4, 0]} />
      <group position={[-25, 0, 3]}>
        <mesh material={mat.wall} position={[0, 3, 0]}>
          <boxGeometry args={[9, 6, 7]} />
        </mesh>
        <mesh geometry={roofGeometry(6.8, 3.2, 0.9)} material={mat.roof} position={[0, 6, 0]} />
      </group>
      <mesh geometry={domeGeometry} material={lodDomeMaterial()} renderOrder={10} raycast={() => null} />
    </group>
  );
}
