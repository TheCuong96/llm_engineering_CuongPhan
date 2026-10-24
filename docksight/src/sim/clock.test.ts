import { describe, expect, it } from 'vitest';
import { MAX_TICKS_PER_ADVANCE, SimClock } from './clock';
import { createRng } from './rng';

describe('SimClock', () => {
  it('runs 10 ticks per simulated second at the default 12×', () => {
    const clock = new SimClock();
    expect(clock.speed).toBe(12);
    let ticks = 0;
    for (let i = 0; i < 60; i++) ticks += clock.advance(1 / 60);
    expect(ticks).toBe(120);
  });

  it('pauses and clamps speed to 1×–60×', () => {
    const clock = new SimClock();
    clock.togglePause();
    expect(clock.advance(1)).toBe(0);
    clock.togglePause();
    clock.setSpeed(500);
    expect(clock.speed).toBe(60);
    clock.setSpeed(0);
    expect(clock.speed).toBe(1);
    expect(clock.advance(1)).toBe(10);
  });

  it('caps catch-up after a long stall', () => {
    const clock = new SimClock();
    clock.setSpeed(60);
    expect(clock.advance(30)).toBe(MAX_TICKS_PER_ADVANCE);
    expect(clock.alpha).toBe(0);
  });
});

describe('rng', () => {
  it('repeats for the same seed and differs across seeds', () => {
    const a = createRng(42);
    const b = createRng(42);
    const c = createRng(43);
    const seqA = Array.from({ length: 5 }, () => a.next());
    expect(Array.from({ length: 5 }, () => b.next())).toEqual(seqA);
    expect(Array.from({ length: 5 }, () => c.next())).not.toEqual(seqA);
    for (const x of seqA) expect(x).toBeGreaterThanOrEqual(0);
  });
});
