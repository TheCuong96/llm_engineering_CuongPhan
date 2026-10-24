import { Billboard, Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { DoubleSide, Group, MeshBasicMaterial, RingGeometry } from 'three';
import { color } from '../design/tokens';
import type { Vec3 } from '../sim/geometry';
import type { Selection } from '../sim/types';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { entityLabel, entityPos, FRAME, padLabel } from './entityPos';

declare global {
  interface Window {
    /** What the overlays currently show, for e2e checks. */
    __overlay?: { frame: string | null; labels: string[]; path: 'none' | 'solid' | 'dashed' | 'both'; ring: string | null };
  }
}
const overlayState: NonNullable<Window['__overlay']> = { frame: null, labels: [], path: 'none', ring: null };
if (typeof window !== 'undefined') window.__overlay = overlayState;

// One rune corner for half-size 1: an L with a short broken tick, like a stroke of a seal script.
const CORNER: Vec3[] = [
  [-1, -0.55, 0],
  [-1, -1, 0],
  [-0.55, -1, 0],
  [-0.4, -1, 0],
  [-0.4, -1.12, 0],
];
const CORNERS = [0, 1, 2, 3].map((q) => CORNER.map(([x, y, z]): Vec3 => [q % 3 === 0 ? x : -x, q < 2 ? y : -y, z]));

/** Four violet corners around the selection, always facing the camera (spec §5.4). */
function RuneFrame() {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { selected } = useSelection.getState();
    const pos = selected && selected.kind !== 'peak' ? entityPos(useSim.getState().world, selected) : null;
    g.visible = Boolean(pos);
    overlayState.frame = pos ? `${selected!.kind}:${selected!.id}` : null;
    if (!pos) return;
    const f = FRAME[selected!.kind];
    g.position.set(pos[0], pos[1] + f.lift * 0.45, pos[2]);
    g.scale.setScalar(f.half);
  });
  return (
    <group ref={group} visible={false}>
      <Billboard>
        {CORNERS.map((pts, i) => (
          <Line key={i} points={pts} color={color.accent} lineWidth={2.5} depthTest={false} renderOrder={20} />
        ))}
      </Billboard>
    </group>
  );
}

/** Chip-styled label floating over an entity. Sits under the HUD (low z-index). */
function FloatingChip({ which }: { which: 'selected' | 'hovered' }) {
  const group = useRef<Group>(null);
  const [text, setText] = useState<string | null>(null);
  const since = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { selected, hovered } = useSelection.getState();
    const sel: Selection = which === 'selected' ? selected : hovered && (hovered.kind !== selected?.kind || hovered.id !== selected?.id) ? hovered : null;
    const world = useSim.getState().world;
    const pos = sel && sel.kind !== 'peak' ? entityPos(world, sel) : null;
    g.visible = Boolean(pos);
    if (pos) g.position.set(pos[0], pos[1] + FRAME[sel!.kind].lift, pos[2]);
    since.current += dt;
    if (since.current > 0.2 || (pos ? text === null : text !== null)) {
      since.current = 0;
      const next = pos ? entityLabel(world, sel) : null;
      if (next !== text) setText(next);
    }
  });

  if (text) overlayState.labels = [...new Set([...overlayState.labels.filter((l) => l !== text), text])].slice(-2);
  return (
    <group ref={group}>
      {text && (
        <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span
            data-scene-label={which}
            className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-chip font-medium shadow-sm ${which === 'selected' ? 'bg-accent text-white' : 'bg-white/90 text-accent-ink ring-1 ring-accent/20'}`}
          >
            {text}
          </span>
        </Html>
      )}
    </group>
  );
}

const ringMat = new MeshBasicMaterial({ color: color.accent, transparent: true, opacity: 0.38, depthWrite: false, side: DoubleSide });

/** Bát quái ring: outer circle plus eight trigram bars, rotating slowly under a hovered pad or array. */
function BaguaRing() {
  const group = useRef<Group>(null);
  const [label, setLabel] = useState<string | null>(null);
  const ring = useMemo(() => new RingGeometry(0.92, 1, 8, 1), []);
  const inner = useMemo(() => new RingGeometry(0.5, 0.56, 8, 1), []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const { hoveredPad, hovered } = useSelection.getState();
    const world = useSim.getState().world;
    let at: Vec3 | null = null;
    let radius = 6;
    let text: string | null = null;
    if (hoveredPad) {
      const [peakId, padId] = hoveredPad.split('/');
      at = world.peaks.find((p) => p.id === peakId)?.pads.find((p) => p.id === padId)?.pos ?? null;
      text = padLabel(world, hoveredPad);
    } else if (hovered?.kind === 'array') {
      at = entityPos(world, hovered);
      radius = 4.6;
    }
    g.visible = Boolean(at);
    overlayState.ring = at ? (hoveredPad ?? hovered?.id ?? null) : null;
    if (at) {
      g.position.set(at[0], at[1] + 0.35, at[2]);
      g.scale.setScalar(radius);
      g.rotation.y = clock.elapsedTime * 0.25;
    }
    if (text !== label) setLabel(text);
  });

  return (
    <group ref={group} visible={false}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={ring} material={ringMat} renderOrder={15} />
        <mesh geometry={inner} material={ringMat} renderOrder={15} />
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            {[0.66, 0.73, 0.8].map((r, j) => (
              <mesh key={j} material={ringMat} position={[r, 0, 0]} renderOrder={15}>
                <planeGeometry args={[0.035, (i + j) % 3 === 0 ? 0.08 : 0.2]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {label && (
        <Html center position={[0, 1.1, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span data-scene-label="pad" className="whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-chip font-medium text-accent-ink ring-1 ring-accent/20">
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}

/**
 * Linh quang path for a selected incoming ship (spec §5.4): a solid violet line along its
 * current leg to the barrier gate, then a dashed leg down to the reserved pad. These are
 * the exact straight legs the engine moves the ship along.
 *
 * Points go through props (re-rendered at most ~10×/s): mutating drei's Line geometry in
 * place left the instanced line buffers stale and nothing was drawn.
 */
function FlightPath() {
  const [path, setPath] = useState<{ solid: Vec3[] | null; dashed: Vec3[] | null }>({ solid: null, dashed: null });
  const last = useRef({ key: '', at: 0 });
  useFrame(({ clock }) => {
    const { selected } = useSelection.getState();
    const world = useSim.getState().world;
    const ship = selected?.kind === 'ship' ? world.ships.get(selected.id) : undefined;
    const peak = ship ? world.peaks.find((p) => p.id === ship.homePeakId) : undefined;
    const pad = peak?.pads.find((p) => p.id === ship?.padId);
    const pos = ship ? (entityPos(world, selected) ?? ship.pos) : null;
    const showSolid = Boolean(ship && peak && pos && (ship.state === 'sailing' || ship.state === 'at_barrier'));
    const showDashed = Boolean(ship && pad && pos && (ship.state === 'sailing' || ship.state === 'at_barrier' || ship.state === 'landing'));
    overlayState.path = showSolid && showDashed ? 'both' : showSolid ? 'solid' : showDashed ? 'dashed' : 'none';

    const solid = showSolid ? [pos!, peak!.geometry.gate] : null;
    const dashed = showDashed ? [ship!.state === 'landing' ? pos! : peak!.geometry.gate, pad!.pos] : null;
    const key = JSON.stringify([solid, dashed]?.map((l) => l?.map((v) => v.map((n) => Math.round(n * 2)))));
    if (key === last.current.key || clock.elapsedTime - last.current.at < 0.1) return;
    last.current = { key, at: clock.elapsedTime };
    setPath({ solid, dashed });
  });
  return (
    <>
      {path.solid && <Line points={path.solid} color={color.accent} lineWidth={3} transparent opacity={0.85} />}
      {path.dashed && <Line points={path.dashed} color={color.accent} lineWidth={2.5} dashed dashSize={1.6} gapSize={1.1} />}
    </>
  );
}

export function Overlays() {
  return (
    <group name="overlays">
      <RuneFrame />
      <FlightPath />
      <BaguaRing />
      <FloatingChip which="selected" />
      <FloatingChip which="hovered" />
    </group>
  );
}
