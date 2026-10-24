// Token colours for code that cannot read CSS variables (the 3D scene).
// colors.test.ts keeps these in lockstep with tokens.css.

export const color = {
  ground: '#f9fafd',
  lavender: '#d2d8eb',
  brandRoof: '#144fcb',
  accent: '#3b79f4',
  successBar: '#22b249',
  warningBar: '#e8830c',
  ink: '#0f1b3d',
} as const;

export const motion = {
  panelMs: 250,
  countMs: 750,
  cameraFlyMs: 1250,
} as const;
