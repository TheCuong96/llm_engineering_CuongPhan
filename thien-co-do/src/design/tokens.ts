// Design tokens (spec §8). Source of truth for 3D materials and for the contrast test;
// tokens.css mirrors the HUD subset and a test keeps the two in sync.

export const color = {
  groundPaper: '#F6F2E9',
  cloudTop: '#FFFFFF',
  cloudLow: '#ECE8F4',
  mist: '#DCD6EA',
  stone: '#B9BEC9',
  roofJade: '#2D5E57', // 3D assets only
  pillarCinnabar: '#B5462F', // 3D assets only, never in HUD

  accent: '#6D4AE0',
  accentInk: '#5536C4',
  accentTint: '#EEE9FC',

  successBar: '#1F9D6B',
  successInk: '#116B4A',
  successBg: '#DDF3E9',
  warningBar: '#D98E1C',
  warningInk: '#9A5B00',
  warningBg: '#FCEBCB',
  dangerInk: '#B23A26',
  dangerBg: '#FBE2DC',
  neutralInk: '#55506A',
  neutralBg: '#EEEDF2',

  text: '#1F1B2E',
  textMuted: '#6B6680',
  hudBg: '#FBF8F2',
} as const;

export type ChipTone = 'success' | 'warning' | 'motion' | 'neutral' | 'danger';

/** Chip palette (spec §4.6): every pair must reach WCAG AA 4.5:1. */
export const chipTones: Record<ChipTone, { bg: string; ink: string }> = {
  success: { bg: color.successBg, ink: color.successInk },
  warning: { bg: color.warningBg, ink: color.warningInk },
  motion: { bg: color.accentTint, ink: color.accentInk },
  neutral: { bg: color.neutralBg, ink: color.neutralInk },
  danger: { bg: color.dangerBg, ink: color.dangerInk },
};

export const motion = {
  panelMs: 250,
  countUpMs: 750,
  cameraFlyMs: 1400,
  reducedFadeMs: 200,
} as const;

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
