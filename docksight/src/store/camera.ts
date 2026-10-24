import { create } from 'zustand';

/** Imperative camera API registered by the scene's CameraRig; HUD buttons call into it. */
export interface CameraApi {
  zoomIn(): void;
  zoomOut(): void;
  rotateLeft(): void;
  rotateRight(): void;
  reset(): void;
}

interface CameraState {
  api: CameraApi | null;
  register(api: CameraApi | null): void;
}

export const useCamera = create<CameraState>((set) => ({
  api: null,
  register: (api) => set({ api }),
}));
