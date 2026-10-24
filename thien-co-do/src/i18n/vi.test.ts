import { describe, expect, it } from 'vitest';
import { vi as strings } from './vi';

function leaves(node: unknown, path: string[] = []): [string, string][] {
  if (typeof node === 'string') return [[path.join('.'), node]];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => leaves(v, [...path, k]));
}

describe('vi strings', () => {
  it.each(leaves(strings))('%s is non-empty', (_path, value) => {
    expect(value.trim().length).toBeGreaterThan(0);
  });

  it('uses only ASCII identifiers as keys', () => {
    for (const [path] of leaves(strings)) expect(path).toMatch(/^[A-Za-z0-9._-]+$/);
  });
});
