import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
const token = (name: string) => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(css);
  if (!m) throw new Error(`token --color-${name} missing from tokens.css`);
  return m[1]!;
};

describe('contrastRatio', () => {
  it('matches the WCAG reference points', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#3b79f4', '#f9fafd')).toBeCloseTo(contrastRatio('#f9fafd', '#3b79f4'), 10);
  });
});

describe('chip tokens', () => {
  for (const tone of ['success', 'warning', 'info', 'neutral']) {
    it(`${tone} chip text reaches AA (≥ 4.5:1)`, () => {
      expect(contrastRatio(token(`chip-${tone}-text`), token(`chip-${tone}-bg`))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('documents why the bar colours are not used for chip text', () => {
    expect(contrastRatio(token('warning-bar'), token('chip-warning-bg'))).toBeLessThan(4.5);
    expect(contrastRatio(token('success-bar'), token('chip-success-bg'))).toBeLessThan(4.5);
  });
});
