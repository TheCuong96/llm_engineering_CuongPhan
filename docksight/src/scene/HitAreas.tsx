// Invisible pick volumes for things that are not entity meshes of their own: dock bays and
// charger spots. A truck parked in a bay sits on top and catches the click first.

import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { BoxGeometry, MeshBasicMaterial } from 'three';
import { DOCK_REAR_GAP, TRUCK_LENGTH } from '../sim/layout';
import type { Site } from '../sim/types';
import { chargerSelId, useSelection } from '../store/selection';
import { CLICK_SLOP, isShown, pickHandlers } from './picking';

const hitBox = new BoxGeometry(1, 1, 1);
// Raycasts need a visible mesh; a fully transparent material draws nothing.
const invisible = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const BAY_LEN = TRUCK_LENGTH + 1;

/**
 * Dock bays (spec 4.6 convention): a dock with a truck selects the truck; an empty dock opens
 * the site card scrolled to "Truck bays". Hovering a bay lights it and shows "Bay 2 · Docking".
 */
function DockBay({ site, dockId, x }: { site: Site; dockId: string; x: number }) {
  const key = `${site.id}/${dockId}`;
  const handlers = useMemo(
    () => ({
      onClick: (e: ThreeEvent<MouseEvent>) => {
        if (e.delta > CLICK_SLOP || !isShown(e.object)) return;
        e.stopPropagation();
        const dock = site.docks.find((d) => d.id === dockId);
        const sel = useSelection.getState();
        if (dock?.truckId) sel.select({ kind: 'truck', id: dock.truckId });
        else sel.select({ kind: 'site', id: site.id }, 'bays');
      },
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        useSelection.getState().hoverDock(key);
        document.body.style.cursor = 'pointer';
      },
      onPointerOut: () => {
        if (useSelection.getState().hoveredDock === key) useSelection.getState().hoverDock(null);
        document.body.style.cursor = 'auto';
      },
    }),
    [site, dockId, key],
  );
  return (
    <mesh
      name={`dock-hit:${key}`}
      geometry={hitBox}
      material={invisible}
      position={[x, 0.6, DOCK_REAR_GAP + BAY_LEN / 2 - 0.5]}
      scale={[4.8, 1.2, BAY_LEN]}
      {...handlers}
    />
  );
}

function ChargerSpot({ site, chargerId, at }: { site: Site; chargerId: string; at: [number, number, number] }) {
  const pick = useMemo(() => pickHandlers(() => ({ kind: 'charger', id: chargerSelId(site.id, chargerId) })), [site.id, chargerId]);
  return <mesh name={`charger-hit:${chargerId}`} geometry={hitBox} material={invisible} position={[at[0] + 0.6, 1, at[2]]} scale={[4.6, 2, 3.2]} {...pick} />;
}

export function HitAreas({ site }: { site: Site }) {
  const local = (p: [number, number, number]): [number, number, number] => [p[0] - site.worldPos[0], p[1] - site.worldPos[1], p[2] - site.worldPos[2]];
  return (
    <group name={`hit-areas:${site.id}`} position={site.worldPos}>
      {site.docks.map((d) => (
        <DockBay key={d.id} site={site} dockId={d.id} x={local(d.pos)[0]} />
      ))}
      {site.chargers.map((c) => (
        <ChargerSpot key={c.id} site={site} chargerId={c.id} at={local(c.pos)} />
      ))}
    </group>
  );
}
