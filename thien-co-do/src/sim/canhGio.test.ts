import { describe, expect, it } from 'vitest';
import { EARTHLY_BRANCHES, toCanhGio } from './canhGio';

const at = (h: number, m = 0, s = 0) => new Date(2026, 9, 23, h, m, s);

describe('toCanhGio', () => {
  it.each([
    [at(22, 59, 59), 'pig'],
    [at(23, 0), 'rat'],
    [at(23, 59, 59), 'rat'],
    [at(0, 0), 'rat'],
    [at(0, 59, 59), 'rat'],
    [at(1, 0), 'ox'],
    [at(2, 59), 'ox'],
    [at(3, 0), 'tiger'],
    [at(9, 0), 'snake'],
    [at(9, 40), 'snake'],
    [at(10, 59, 59), 'snake'],
    [at(11, 0), 'horse'],
    [at(12, 0), 'horse'],
    [at(13, 0), 'goat'],
    [at(20, 59), 'dog'],
    [at(21, 0), 'pig'],
  ] as const)('%s → %s', (date, expected) => {
    expect(toCanhGio(date)).toBe(expected);
  });

  it('covers every hour with each watch spanning exactly two hours', () => {
    const counts = new Map<string, number>();
    for (let h = 0; h < 24; h++) {
      const branch = toCanhGio(at(h, 30));
      counts.set(branch, (counts.get(branch) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual([...EARTHLY_BRANCHES].sort());
    for (const n of counts.values()) expect(n).toBe(2);
  });
});
