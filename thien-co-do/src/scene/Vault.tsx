import type { Vec3 } from '../sim/geometry';
import { mat } from './palette';
import { roofGeometry } from './shapes';

const FLOORS = [
  { s: 8, h: 3.6 },
  { s: 6.6, h: 2.8 },
  { s: 5.2, h: 2.4 },
].map((f, i, all) => ({ ...f, roof: roofGeometry(f.s * 0.72, i === all.length - 1 ? 2.6 : 1, 0.7) }));

/** Tàng Bảo Các: three-storey tower; the open ground-floor door (facing local +X) shows chest racks. */
export function Vault({ position }: { position: Vec3 }) {
  let y = 0.6;
  const floors = FLOORS.map((f, i) => {
    const node = (
      <group key={i} position={[0, y, 0]}>
        <mesh material={mat.wall} position={[0, f.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[f.s, f.h, f.s]} />
        </mesh>
        <mesh
          geometry={f.roof}
          material={mat.roof}
          position={[0, f.h, 0]}
          castShadow
        />
      </group>
    );
    y += f.h + (i === FLOORS.length - 1 ? 0 : 0.9);
    return node;
  });

  const half = FLOORS[0]!.s / 2;
  return (
    <group position={position}>
      <mesh material={mat.stone} position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.6, 9.4]} />
      </mesh>
      {floors}
      {/* open doorway and a glimpse of racks inside */}
      <mesh material={mat.door} position={[half + 0.01, 2.1, 0]}>
        <boxGeometry args={[0.05, 2.8, 3]} />
      </mesh>
      {[0.9, 1.9, 2.9].map((h) => (
        <mesh key={h} material={mat.wood} position={[half + 0.04, h, 0]}>
          <boxGeometry args={[0.05, 0.1, 2.6]} />
        </mesh>
      ))}
      {[[1.3, -0.7], [1.3, 0.5], [2.3, 0], [3.3, -0.6]].map(([h, z], i) => (
        <mesh key={i} material={mat.wood} position={[half + 0.08, h!, z!]}>
          <boxGeometry args={[0.1, 0.6, 0.7]} />
        </mesh>
      ))}
    </group>
  );
}
