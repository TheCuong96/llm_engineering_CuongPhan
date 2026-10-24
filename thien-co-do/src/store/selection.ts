import { create } from 'zustand';
import type { Selection } from '../sim/types';

export type SelectionKind = NonNullable<Selection>['kind'];
export type Sel = NonNullable<Selection>;

/** Arrays are only unique per peak, so their selection id is "PH-01/T1". */
export const arraySelId = (peakId: string, arrayId: string) => `${peakId}/${arrayId}`;

interface SelectionState {
  /** Single source of truth (spec §7.2). Scene, dispatch board, search and notices all write here. */
  selected: Selection;
  hovered: Selection;
  /** Optional section of the detail panel to scroll to (clicking an empty pad → "pads"). */
  focusSection: string | null;
  /** Hovered pad ("PH-01/pad-2"); pads are not selectable themselves (spec §4.4). */
  hoveredPad: string | null;
  /** Bumped to ask the camera to fly to the current selection (search, board, notices, Định vị). */
  flyRequest: number;
  select(sel: Selection, focusSection?: string): void;
  hover(sel: Selection): void;
  hoverPad(id: string | null): void;
  requestFly(): void;
}

export const useSelection = create<SelectionState>((set) => ({
  selected: null,
  hovered: null,
  focusSection: null,
  hoveredPad: null,
  flyRequest: 0,
  select: (selected, focusSection) => set({ selected, focusSection: focusSection ?? null }),
  hover: (hovered) => set({ hovered }),
  hoverPad: (hoveredPad) => set({ hoveredPad }),
  requestFly: () => set((s) => ({ flyRequest: s.flyRequest + 1 })),
}));

export const sameSel = (a: Selection, b: Selection) => a?.kind === b?.kind && a?.id === b?.id;
