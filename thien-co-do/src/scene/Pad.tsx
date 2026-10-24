import { Text } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import fontUrl from '@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-600-normal.woff?url';
import type { Pad as PadModel } from '../sim/types';
import type { ThreeEvent } from '@react-three/fiber';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { mat, sceneColor } from './palette';
import { CLICK_SLOP, isShown } from './picking';

const RADIUS = 5;

/** Phi chu đài: octagonal stone pier with a faint gold rune ring, its number, and two lamp posts. */
export function Pad({ pad, index, facingRad, peakId }: { pad: PadModel; index: number; facingRad: number; peakId: string }) {
  const key = `${peakId}/${pad.id}`;
  // Clicking a pad selects its ship; an empty pad opens the peak card at "Phi chu đài" (spec §4.4).
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP || !isShown(e.object)) return;
    e.stopPropagation();
    const shipId = useSim.getState().world.peaks.find((p) => p.id === peakId)?.pads.find((p) => p.id === pad.id)?.shipId;
    if (shipId) useSelection.getState().select({ kind: 'ship', id: shipId });
    else useSelection.getState().select({ kind: 'peak', id: peakId }, 'pads');
  };
  return (
    <group
      position={pad.pos}
      rotation={[0, facingRad, 0]}
      name={`pad:${key}`}
      onClick={onClick}
      onPointerOver={(e) => {
        if (!isShown(e.object)) return;
        e.stopPropagation();
        useSelection.getState().hoverPad(key);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        useSelection.getState().hoverPad(null);
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh material={mat.stone} position={[0, -0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[RADIUS, RADIUS * 0.82, 1.4, 8]} />
      </mesh>
      <mesh material={mat.paper} position={[0, 0.11, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS * 0.94, RADIUS * 0.94, 0.04, 8]} />
      </mesh>
      <mesh material={mat.rune} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <ringGeometry args={[RADIUS * 0.62, RADIUS * 0.7, 8]} />
      </mesh>
      <mesh material={mat.rune} rotation={[-Math.PI / 2, 0, Math.PI / 8]} position={[0, 0.14, 0]}>
        <ringGeometry args={[RADIUS * 0.36, RADIUS * 0.4, 8]} />
      </mesh>
      <Text
        font={fontUrl}
        fontSize={1.6}
        color={sceneColor.runeInk}
        rotation={[-Math.PI / 2, 0, 0]} // reads upright from the default view (camera on local +Z side)
        position={[0, 0.16, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {String(index + 1)}
      </Text>
      {[-1, 1].map((side) => (
        <group key={side} position={[RADIUS * 0.55, 0, side * RADIUS * 0.8]}>
          <mesh material={mat.wood} position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 2.8, 5]} />
          </mesh>
          <Select enabled>
            <mesh material={mat.lamp} position={[0, 2.95, 0]}>
              <octahedronGeometry args={[0.32, 0]} />
            </mesh>
          </Select>
        </group>
      ))}
    </group>
  );
}
