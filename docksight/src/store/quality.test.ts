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

  it('exactly 45 fps is not "under 45"', () => {
    let s = { level: 0, lowSeconds: 0 };
    for (let i = 0; i < 10; i++) s = governorStep(s.level, s.lowSeconds, 45);
    expect(s).toEqual({ level: 0, lowSeconds: 0 });
  });

  it('never goes past the last step and never steps back up on its own', () => {
    let s = { level: 0, lowSeconds: 0 };
    for (let i = 0; i < 60; i++) s = governorStep(s.level, s.lowSeconds, 10);
    expect(s.level).toBe(MAX_LEVEL);
    for (let i = 0; i < 10; i++) s = governorStep(s.level, s.lowSeconds, 120);
    expect(s.level).toBe(MAX_LEVEL);
  });

  it('turns costs off most expensive first: AO → post-processing → shadows + DPR', () => {
    const off = [0, 1, 2, 3].map((l) => Object.entries(effects(l)).filter(([, on]) => on === false).map(([k]) => k));
    expect(off).toEqual([[], ['ao'], ['ao', 'post'], ['ao', 'post', 'shadows']]);
    expect(effects(0).maxDpr).toBe(1.5);
    expect(effects(MAX_LEVEL).maxDpr).toBe(1);
  });
});
