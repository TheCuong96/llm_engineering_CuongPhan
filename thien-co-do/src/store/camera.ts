import { create } from 'zustand';

/** Imperative camera API registered by the scene's CameraRig; HUD buttons call into it. */
export interface CameraApi {
  zoomIn(): void;
  zoomOut(): void;
  rotateLeft(): void;
  rotateRight(): void;
  reset(): void;
  /** Glide the target to a point, closing in to at most `distance`. */
  focus(pos: [number, number, number], distance: number): void;
}

export type ViewMode = 'peak' | 'overview';

interface CameraState {
  api: CameraApi | null;
  /** 'overview' = toàn cảnh tông môn: high above all five peaks (spec §4.3). */
  mode: ViewMode;
  /** True while the camera flies between peaks; panels fade meanwhile (spec §5.1). */
  flying: boolean;
  /** Bumped for the reduced-motion 200 ms fade that replaces the flight. */
  fadeNonce: number;
  register(api: CameraApi | null): void;
  setMode(mode: ViewMode): void;
}

export const useCamera = create<CameraState>((set) => ({
  api: null,
  mode: 'peak',
  flying: false,
  fadeNonce: 0,
  register: (api) => set({ api }),
  setMode: (mode) => set({ mode }),
}));
