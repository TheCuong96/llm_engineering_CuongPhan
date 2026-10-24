import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { motion as motionTokens } from '../design/tokens';
import { useSelection, type Sel } from '../store/selection';
import { useSim } from '../store/sim';

/** Re-render with the engine's throttled HUD tick and return the live store state. */
export function useSimTick() {
  useSim((s) => s.version);
  useSim((s) => s.viewPeakId);
  return useSim.getState();
}

/**
 * Count from the old value to the new one when `animateKey` changes (spec §4.2: switching
 * peaks, 600–900 ms). Live drift within the same peak snaps. Instant with reduced motion.
 */
export function useCountUp(target: number, animateKey: string, durationMs: number = motionTokens.countUpMs): number {
  const reduced = useReducedMotion() ?? false;
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const lastKey = useRef(animateKey);
  const raf = useRef(0);

  useEffect(() => {
    const keyChanged = lastKey.current !== animateKey;
    lastKey.current = animateKey;
    if (!keyChanged) {
      // Same peak: follow live values directly, unless a count-up is still running.
      if (raf.current === 0) {
        shownRef.current = target;
        setShown(target);
      }
      return;
    }
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (reduced) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const from = shownRef.current;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / durationMs);
      const v = from + (target - from) * (1 - (1 - k) ** 3);
      shownRef.current = v;
      setShown(v);
      raf.current = k < 1 ? requestAnimationFrame(tick) : 0;
    };
    raf.current = requestAnimationFrame(tick);
  }, [target, animateKey, reduced, durationMs]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return shown;
}

/** Select an entity and switch the viewed peak if it lives elsewhere. */
/** Used by search, the dispatch board and notices: also asks the camera to fly there (spec §4.6–4.7). */
export function selectEntity(sel: Sel, peakId: string, focusSection?: string): void {
  if (useSim.getState().viewPeakId !== peakId) useSim.setState({ viewPeakId: peakId });
  const s = useSelection.getState();
  s.select(sel, focusSection);
  s.requestFly();
}

export function switchPeak(peakId: string): void {
  useSim.setState({ viewPeakId: peakId });
  useSelection.getState().select(null);
}
