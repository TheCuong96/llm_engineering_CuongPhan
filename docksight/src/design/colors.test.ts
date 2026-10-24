import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { color } from './colors';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

describe('colors.ts mirrors tokens.css', () => {
  it.each(Object.entries(color))('%s', (name, hex) => {
    const cssName = name === 'brandRoof' ? 'brand-roof' : kebab(name);
    const m = new RegExp(`--color-${cssName}:\\s*(#[0-9a-f]{6})`, 'i').exec(css);
    expect(m?.[1]?.toLowerCase(), `--color-${cssName}`).toBe(hex);
  });
});
