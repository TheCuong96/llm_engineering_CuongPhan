import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { motion as motionTokens } from '../design/colors';
import { useSelection, type Sel } from '../store/selection';
import { useSim } from '../store/sim';

/** Re-render with the engine's throttled HUD tick and return the live store state. */
export function useSimTick() {
  useSim((s) => s.version);
  useSim((s) => s.viewSiteId);
  return useSim.getState();
}

/**
 * Count from the old value to the new one when `animateKey` changes (spec 4.2: switching
 * sites, 600–900 ms). Live drift within the same site snaps. Instant with reduced motion.
 */
export function useCountUp(target: number, animateKey: string, durationMs: number = motionTokens.countMs): number {
  const reduced = useReducedMotion() ?? false;
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const lastKey = useRef(animateKey);
  const raf = useRef(0);

  useEffect(() => {
    const keyChanged = lastKey.current !== animateKey;
    lastKey.current = animateKey;
    if (!keyChanged) {
      // Same site: follow live values directly, unless a count-up is still running.
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

/**
 * Select an entity, switching the viewed site if it lives elsewhere, and ask the camera to
 * fly there. Used by search, the fleet board and notifications (spec 4.6–4.7).
 */
export function selectEntity(sel: Sel, siteId: string, focusSection?: string): void {
  if (useSim.getState().viewSiteId !== siteId) useSim.setState({ viewSiteId: siteId });
  const s = useSelection.getState();
  s.select(sel, focusSection);
  s.requestFly();
}

export function switchSite(siteId: string): void {
  useSim.setState({ viewSiteId: siteId });
  useSelection.getState().select(null);
}
