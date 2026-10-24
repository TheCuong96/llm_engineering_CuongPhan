import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chipTones, color, contrastRatio } from './tokens';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8').toLowerCase();

describe('chip palette', () => {
  it.each(Object.entries(chipTones))('%s text reaches 4.5:1 on its background', (_tone, { bg, ink }) => {
    expect(contrastRatio(ink, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('computes known reference ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#6D4AE0', '#FFFFFF')).toBeCloseTo(5.7, 1);
  });
});

describe('tokens.css mirrors tokens.ts', () => {
  const hudKeys = Object.entries(color).filter(([key]) => !['roofJade', 'pillarCinnabar', 'stone'].includes(key));

  it.each(hudKeys)('%s is declared in CSS', (_key, hex) => {
    expect(css).toContain(hex.toLowerCase());
  });

  it('keeps 3D-only colors out of the HUD', () => {
    expect(css).not.toContain(color.pillarCinnabar.toLowerCase());
    expect(css).not.toContain(color.roofJade.toLowerCase());
  });
});
