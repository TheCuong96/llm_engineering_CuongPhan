// Fixed-step clock (spec §7.4): 10 ticks per simulated second, speed 1×–60×, pausable.

export const TICK_HZ = 10;
export const TICK_DT = 1 / TICK_HZ;
export const SPEED_MIN = 1;
export const SPEED_MAX = 60;
export const DEFAULT_SPEED = 12;
/** Guards against a spiral of death after a long frame (tab in background, debugger). */
export const MAX_TICKS_PER_ADVANCE = 1200;

export class SimClock {
  speed = DEFAULT_SPEED;
  paused = false;
  private acc = 0;

  setSpeed(speed: number): void {
    this.speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
  }

  togglePause(): void {
    this.paused = !this.paused;
  }

  /** Feed real elapsed seconds; returns how many fixed ticks to run now. */
  advance(realDtSec: number): number {
    if (this.paused || realDtSec <= 0) return 0;
    this.acc += realDtSec * this.speed;
    let ticks = Math.floor(this.acc / TICK_DT + 1e-9);
    if (ticks > MAX_TICKS_PER_ADVANCE) {
      ticks = MAX_TICKS_PER_ADVANCE;
      this.acc = 0;
    } else {
      this.acc -= ticks * TICK_DT;
    }
    return ticks;
  }

  /** Fraction of the next tick already elapsed, for render interpolation. */
  get alpha(): number {
    return Math.min(this.acc / TICK_DT, 1);
  }
}
