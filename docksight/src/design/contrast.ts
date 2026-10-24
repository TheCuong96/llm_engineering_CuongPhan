/** Parses '#rrggbb' into 0–255 channels. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Not a #rrggbb colour: ${hex}`);
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * WCAG 2.x contrast ratio between two colours, from 1 (identical) to 21 (black on white).
 * Used to keep every chip label at ≥ 4.5:1 on its chip background (spec 4.6).
 */
export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [relativeLuminance(fg), relativeLuminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** sRGB → linear light per channel, then weighted by the eye's sensitivity (green dominates). */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
