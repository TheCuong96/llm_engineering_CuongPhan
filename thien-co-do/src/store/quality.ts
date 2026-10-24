import { create } from 'zustand';

/**
 * Quality ladder (spec §12): each step turns off one more effect, in this order —
 * particles → bloom (with tilt-shift) → cranes → animated waterfall.
 */
export const QUALITY_STEPS = ['full', 'no-particles', 'no-bloom', 'no-cranes', 'static-water'] as const;
export const MAX_LEVEL = QUALITY_STEPS.length - 1;

/** Auto-degrade when FPS stays under this for this many consecutive 1-second samples (P7). */
export const FPS_FLOOR = 45;
export const LOW_SECONDS = 3;

const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

interface QualityState {
  level: number;
  /** Disabled with ?autoQuality=off (stable evidence screenshots on software-GL CI). */
  auto: boolean;
  /** ?fps=30 replaces the measured FPS, to exercise the governor in tests. */
  fakeFps: number | null;
  setLevel(level: number): void;
}

export const useQuality = create<QualityState>((set) => ({
  level: Math.min(MAX_LEVEL, Math.max(0, Number(params.get('quality') ?? 0) || 0)),
  auto: params.get('autoQuality') !== 'off',
  fakeFps: params.has('fps') ? Number(params.get('fps')) : null,
  setLevel: (level) => set({ level: Math.min(MAX_LEVEL, Math.max(0, level)) }),
}));

export const effects = (level: number) => ({
  particles: level < 1,
  bloom: level < 2,
  cranes: level < 3,
  waterfallMotion: level < 4,
});

/** Software rasterisers can't afford bloom: start them at step 2 instead of waiting 6 s to find out. */
export const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render/i;
export const SOFTWARE_START_LEVEL = 2;

/** Pure governor step: returns the next level and the updated count of low seconds. */
export function governorStep(level: number, lowSeconds: number, fps: number): { level: number; lowSeconds: number } {
  const low = fps < FPS_FLOOR ? lowSeconds + 1 : 0;
  if (low >= LOW_SECONDS && level < MAX_LEVEL) return { level: level + 1, lowSeconds: 0 };
  return { level, lowSeconds: low };
}
