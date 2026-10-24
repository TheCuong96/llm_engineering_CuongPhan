import { step } from '../sim/world';
import { useSim } from './sim';

const HUD_REFRESH_S = 0.25;

/**
 * Drives the engine from requestAnimationFrame, independent of the 3D canvas: if WebGL is
 * missing or the scene crashes, the world keeps ticking and the HUD stays live.
 * Real frame time → fixed 10 Hz sim ticks. React only re-renders when the roster changes or
 * (throttled to 4 Hz) for the HUD; the scene reads the world directly every frame.
 */
export function startSimLoop(): () => void {
  let raf = 0;
  let last = performance.now();
  let seq = useSim.getState().world.log.seq;
  let sinceHud = 0;

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    const { world, clock } = useSim.getState();
    const ticks = clock.advance(dt);
    for (let i = 0; i < ticks; i++) step(world);

    sinceHud += dt;
    if (world.log.seq !== seq || sinceHud >= HUD_REFRESH_S) {
      let rosterChanged = false;
      const fresh = Math.min(world.log.seq - seq, world.log.events.length);
      for (let i = world.log.events.length - fresh; i < world.log.events.length; i++) {
        const type = world.log.events[i]!.type;
        if (type === 'truck_spawned' || type === 'truck_removed') rosterChanged = true;
      }
      seq = world.log.seq;
      const hud = sinceHud >= HUD_REFRESH_S;
      if (rosterChanged || hud) {
        useSim.setState((st) => ({ version: hud ? st.version + 1 : st.version, roster: rosterChanged ? st.roster + 1 : st.roster }));
        if (hud) sinceHud = 0;
      }
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
