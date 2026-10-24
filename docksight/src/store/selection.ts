import { create } from 'zustand';
import type { Selection } from '../sim/types';

export type Sel = NonNullable<Selection>;

/** Chargers are only unique per site, so their selection id is "WH-01/C1". */
export const chargerSelId = (siteId: string, chargerId: string) => `${siteId}/${chargerId}`;

interface SelectionState {
  /** Single source of truth (spec 7.2). Scene, fleet board, search and notices all write here. */
  selected: Selection;
  hovered: Selection;
  /** Optional section of the detail panel to scroll to (an empty dock → "bays", spec 4.6). */
  focusSection: string | null;
  /** Hovered dock ("WH-01/dock-2"). Docks are not selectable themselves (spec 4.6). */
  hoveredDock: string | null;
  /** Bumped to ask the camera to fly to the current selection (search, board, notices, locate). */
  flyRequest: number;
  select(sel: Selection, focusSection?: string): void;
  hover(sel: Selection): void;
  hoverDock(id: string | null): void;
  requestFly(): void;
}

export const useSelection = create<SelectionState>((set) => ({
  selected: null,
  hovered: null,
  focusSection: null,
  hoveredDock: null,
  flyRequest: 0,
  select: (selected, focusSection) => set({ selected, focusSection: focusSection ?? null }),
  hover: (hovered) => set({ hovered }),
  hoverDock: (hoveredDock) => set({ hoveredDock }),
  requestFly: () => set((s) => ({ flyRequest: s.flyRequest + 1 })),
}));

export const sameSel = (a: Selection, b: Selection) => a?.kind === b?.kind && a?.id === b?.id;

declare global {
  interface Window {
    __selection?: () => SelectionState;
  }
}
if (typeof window !== 'undefined') window.__selection = () => useSelection.getState();
