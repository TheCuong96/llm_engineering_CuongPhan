import { describe, expect, it } from 'vitest';
import { effects, governorStep, MAX_LEVEL } from './quality';

describe('quality governor (P7)', () => {
  it('steps down only after 3 consecutive seconds under 45 fps', () => {
    let s = { level: 0, lowSeconds: 0 };
    for (const fps of [40, 40]) s = governorStep(s.level, s.lowSeconds, fps);
    expect(s).toEqual({ level: 0, lowSeconds: 2 });
    s = governorStep(s.level, s.lowSeconds, 50); // a good second resets the streak
    expect(s).toEqual({ level: 0, lowSeconds: 0 });
    for (const fps of [44, 30, 20]) s = governorStep(s.level, s.lowSeconds, fps);
    expect(s).toEqual({ level: 1, lowSeconds: 0 });
  });

  it('never goes past the last step and never steps back up on its own', () => {
    let s = { level: 0, lowSeconds: 0 };
    for (let i = 0; i < 60; i++) s = governorStep(s.level, s.lowSeconds, 10);
    expect(s.level).toBe(MAX_LEVEL);
    for (let i = 0; i < 10; i++) s = governorStep(s.level, s.lowSeconds, 120);
    expect(s.level).toBe(MAX_LEVEL);
  });

  it('turns effects off in the spec order: particles → bloom → cranes → waterfall', () => {
    const off = [0, 1, 2, 3, 4].map((l) => Object.entries(effects(l)).filter(([, on]) => !on).map(([k]) => k));
    expect(off).toEqual([
      [],
      ['particles'],
      ['particles', 'bloom'],
      ['particles', 'bloom', 'cranes'],
      ['particles', 'bloom', 'cranes', 'waterfallMotion'],
    ]);
  });
});
