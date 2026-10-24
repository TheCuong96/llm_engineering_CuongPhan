// In-scene feedback (spec 5.4): corner frame around the selection, floating chip labels,
// a translucent plate under a hovered dock or charger, and the route of an incoming truck.

import { Billboard, Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { CircleGeometry, ConeGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry } from 'three';
import { color } from '../design/colors';
import type { Vec3 } from '../sim/geometry';
import { DOCK_REAR_GAP, TRUCK_LENGTH } from '../sim/layout';
import type { Selection } from '../sim/types';
import { sameSel, useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { dockHoverLabel, entityLabel, entityPos, FRAME } from './entityPos';

declare global {
  interface Window {
    /** What the overlays currently show, for e2e checks. */
    __overlay?: { frame: string | null; labels: string[]; path: 'none' | 'solid' | 'dashed' | 'both'; plate: string | null };
  }
}
const overlayState: NonNullable<Window['__overlay']> = { frame: null, labels: [], path: 'none', plate: null };
if (typeof window !== 'undefined') window.__overlay = overlayState;

// One corner for half-size 1: an L whose arms run a third of the way along each side.
const CORNER: Vec3[] = [
  [-1, -0.62, 0],
  [-1, -1, 0],
  [-0.62, -1, 0],
];
const CORNERS = [0, 1, 2, 3].map((q) => CORNER.map(([x, y, z]): Vec3 => [q % 3 === 0 ? x : -x, q < 2 ? y : -y, z]));

/** Four blue corners around the selection, always facing the camera (spec 5.4 "khung góc"). */
function CornerFrame() {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { selected } = useSelection.getState();
    const pos = selected && selected.kind !== 'site' ? entityPos(useSim.getState().world, selected) : null;
    g.visible = Boolean(pos);
    overlayState.frame = pos ? `${selected!.kind}:${selected!.id}` : null;
    if (!pos) return;
    const f = FRAME[selected!.kind];
    g.position.set(pos[0], pos[1] + f.lift * 0.4, pos[2]);
    g.scale.setScalar(f.half);
  });
  return (
    <group ref={group} visible={false}>
      <Billboard>
        {CORNERS.map((pts, i) => (
          <Line key={i} points={pts} color={color.accent} lineWidth={3} depthTest={false} renderOrder={20} />
        ))}
      </Billboard>
    </group>
  );
}

/** Pill label floating over the selected or hovered entity. Sits under the HUD (low z-index). */
function FloatingChip({ which }: { which: 'selected' | 'hovered' }) {
  const group = useRef<Group>(null);
  const [text, setText] = useState<string | null>(null);
  const since = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { selected, hovered } = useSelection.getState();
    const sel: Selection = which === 'selected' ? selected : hovered && !sameSel(hovered, selected) ? hovered : null;
    const world = useSim.getState().world;
    const pos = sel && sel.kind !== 'site' ? entityPos(world, sel) : null;
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
            className={`rounded-full px-2.5 py-0.5 text-chip font-semibold whitespace-nowrap shadow-hud ${which === 'selected' ? 'bg-accent text-white' : 'bg-white/95 text-chip-info-text'}`}
          >
            {text}
          </span>
        </Html>
      )}
    </group>
  );
}

const plateMat = new MeshBasicMaterial({ color: color.accent, transparent: true, opacity: 0.22, depthWrite: false, side: DoubleSide });
const bayPlate = new PlaneGeometry(4.6, TRUCK_LENGTH + 1).rotateX(-Math.PI / 2);
const roundPlate = new CircleGeometry(2.4, 32).rotateX(-Math.PI / 2);

/** Translucent blue plate under a hovered dock bay or charger, with the dock's label (spec 5.4). */
function HoverPlate() {
  const bay = useRef<Mesh>(null);
  const round = useRef<Mesh>(null);
  const label = useRef<Group>(null);
  const [text, setText] = useState<string | null>(null);

  useFrame(() => {
    const { hoveredDock, hovered } = useSelection.getState();
    const world = useSim.getState().world;
    let at: Vec3 | null = null; // plate centre
    let labelAt: Vec3 | null = null;
    let kind: 'bay' | 'round' | null = null;
    let next: string | null = null;
    if (hoveredDock) {
      const [siteId, dockId] = hoveredDock.split('/');
      const site = world.sites.find((s) => s.id === siteId);
      const dock = site?.docks.find((d) => d.id === dockId);
      if (site && dock) {
        // Bay box runs from the leveller out past the cab; the label sits at the door end.
        const wallZ = site.worldPos[2];
        at = [dock.pos[0], 0.04, wallZ + DOCK_REAR_GAP + (TRUCK_LENGTH + 1) / 2 - 0.5];
        labelAt = [dock.pos[0], 2.2, wallZ + DOCK_REAR_GAP];
        kind = 'bay';
        next = dockHoverLabel(world, hoveredDock);
      }
    } else if (hovered?.kind === 'charger') {
      at = entityPos(world, hovered);
      kind = 'round';
    }
    overlayState.plate = kind ? (hoveredDock ?? hovered?.id ?? null) : null;
    for (const [ref, k] of [[bay, 'bay'], [round, 'round']] as const) {
      const m = ref.current;
      if (!m) continue;
      m.visible = kind === k;
      if (at && kind === k) m.position.set(at[0], 0.04, at[2]);
    }
    if (label.current && labelAt) label.current.position.set(...labelAt);
    if (next !== text) setText(next);
  });

  return (
    <>
      <mesh ref={bay} geometry={bayPlate} material={plateMat} visible={false} renderOrder={15} />
      <mesh ref={round} geometry={roundPlate} material={plateMat} visible={false} renderOrder={15} />
      <group ref={label}>
        {text && (
          <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <span data-scene-label="dock" className="rounded-full bg-white/95 px-2.5 py-0.5 text-chip font-semibold whitespace-nowrap text-chip-info-text shadow-hud">
              {text}
            </span>
          </Html>
        )}
      </group>
    </>
  );
}

const pinMat = new MeshBasicMaterial({ color: color.accent });
const pinHead = new SphereGeometry(0.7, 14, 10);
const pinTip = new ConeGeometry(0.55, 1.3, 14).rotateX(Math.PI).translate(0, -0.85, 0);

/**
 * Route of a selected incoming truck (spec 5.4): a thick blue line along the road to the gate,
 * then a dashed leg from the gate to a pin in its reserved bay. These are the exact straight
 * legs the engine drives the truck along, so the truck follows the line.
 *
 * Points go through props (re-rendered at most ~10×/s): mutating drei's Line geometry in place
 * leaves its instanced buffers stale.
 */
function TruckRoute() {
  const [path, setPath] = useState<{ solid: Vec3[] | null; dashed: Vec3[] | null }>({ solid: null, dashed: null });
  const pin = useRef<Group>(null);
  const last = useRef({ key: '', at: 0 });
  useFrame(({ clock }) => {
    const { selected } = useSelection.getState();
    const world = useSim.getState().world;
    const truck = selected?.kind === 'truck' ? world.trucks.get(selected.id) : undefined;
    const site = truck ? world.sites.find((s) => s.id === truck.homeSiteId) : undefined;
    const dock = site?.docks.find((d) => d.id === truck?.dockId);
    const pos = truck && truck.siteId !== null ? (entityPos(world, selected) ?? truck.pos) : null;
    const lift = (p: Vec3): Vec3 => [p[0], 0.15, p[2]];
    const showSolid = Boolean(truck && site && pos && (truck.state === 'en_route' || truck.state === 'at_gate'));
    const showDashed = Boolean(truck && dock && pos && (truck.state === 'en_route' || truck.state === 'at_gate' || truck.state === 'docking'));
    overlayState.path = showSolid && showDashed ? 'both' : showSolid ? 'solid' : showDashed ? 'dashed' : 'none';

    if (pin.current) {
      pin.current.visible = showDashed;
      if (showDashed) pin.current.position.set(dock!.pos[0], 3.2 + Math.sin(clock.elapsedTime * 2) * 0.15, dock!.pos[2]);
    }
    const solid = showSolid ? [lift(pos!), lift(site!.geometry.gate)] : null;
    const dashed = showDashed ? [lift(truck!.state === 'docking' ? pos! : site!.geometry.gate), lift(dock!.pos)] : null;
    const key = JSON.stringify([solid, dashed].map((l) => l?.map((v) => v.map((n) => Math.round(n * 2)))));
    if (key === last.current.key || clock.elapsedTime - last.current.at < 0.1) return;
    last.current = { key, at: clock.elapsedTime };
    setPath({ solid, dashed });
  });
  return (
    <>
      {path.solid && <Line points={path.solid} color={color.accent} lineWidth={6} transparent opacity={0.9} />}
      {path.dashed && <Line points={path.dashed} color={color.accent} lineWidth={3.5} dashed dashSize={1.4} gapSize={1} />}
      <group ref={pin} visible={false}>
        <mesh geometry={pinHead} material={pinMat} />
        <mesh geometry={pinTip} material={pinMat} />
      </group>
    </>
  );
}

export function Overlays() {
  return (
    <group name="overlays">
      <CornerFrame />
      <TruckRoute />
      <HoverPlate />
      <FloatingChip which="selected" />
      <FloatingChip which="hovered" />
    </group>
  );
}
