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

interface CameraState {
  api: CameraApi | null;
  /** True while the camera flies between sites (spec 5.1). */
  flying: boolean;
  register(api: CameraApi | null): void;
}

export const useCamera = create<CameraState>((set) => ({
  api: null,
  flying: false,
  register: (api) => set({ api }),
}));
