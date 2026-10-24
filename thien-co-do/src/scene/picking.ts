import type { ThreeEvent } from '@react-three/fiber';
import type { Object3D } from 'three';
import { useSelection, type Sel } from '../store/selection';

/** Pointer travel (px) above which a press counts as a pan, not a click. */
const CLICK_SLOP = 6;

/** Raycasts ignore `visible`; hidden peaks stay mounted, so skip anything under a hidden group. */
export function isShown(o: Object3D | null): boolean {
  for (let n = o; n; n = n.parent) if (!n.visible) return false;
  return true;
}

const setCursor = (c: string) => {
  document.body.style.cursor = c;
};

/**
 * Click selects, hover sets `hovered` (spec §7.2: the scene writes to the same selection as
 * the board, search and notices). `resolve` maps the event to a selection; for instanced
 * meshes it uses `e.instanceId`, so move events keep the hover on the right instance.
 */
export function pickHandlers(rawResolve: (e: ThreeEvent<PointerEvent | MouseEvent>) => Sel | null) {
  const resolve = (e: ThreeEvent<PointerEvent | MouseEvent>) => (isShown(e.object) ? rawResolve(e) : null);
  const hover = (e: ThreeEvent<PointerEvent>) => {
    const sel = resolve(e);
    if (!sel) return;
    e.stopPropagation();
    const cur = useSelection.getState().hovered;
    if (cur?.kind !== sel.kind || cur.id !== sel.id) useSelection.getState().hover(sel);
    setCursor('pointer');
  };
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (e.delta > CLICK_SLOP) return;
      const sel = resolve(e);
      if (!sel) return;
      e.stopPropagation();
      useSelection.getState().select(sel);
    },
    onPointerOver: hover,
    onPointerMove: hover,
    onPointerOut: () => {
      useSelection.getState().hover(null);
      setCursor('auto');
    },
  };
}

export { CLICK_SLOP };
