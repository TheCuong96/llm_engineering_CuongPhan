import { EffectComposer, SelectiveBloom, TiltShift2 } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useRef, type RefObject } from 'react';
import type { Light } from 'three';
import { effects, governorStep, SOFTWARE_RENDERER, SOFTWARE_START_LEVEL, useQuality } from '../store/quality';

declare global {
  interface Window {
    __quality?: () => { level: number; bloom: boolean; particles: boolean; cranes: boolean; waterfallMotion: boolean };
  }
}
window.__quality = () => ({ level: useQuality.getState().level, ...effects(useQuality.getState().level) });

/**
 * Post-processing (spec §5.3): bloom only on what sits inside <Select> (ship glow, array
 * light, talismans, lamps, qi motes) — the paper-white ground and clouds are brighter than
 * that violet glow, so a luminance threshold would flare them. Plus a light tilt-shift at the
 * top and bottom edges. Both go away at quality step 2; the HUD is DOM and never touched.
 */
export function Effects({ lights }: { lights: RefObject<Light | null>[] }) {
  const level = useQuality((s) => s.level);
  if (!effects(level).bloom) return null;
  return (
    <EffectComposer multisampling={4}>
      <SelectiveBloom lights={lights as RefObject<Light>[]} luminanceThreshold={0.15} luminanceSmoothing={0.2} intensity={0.75} mipmapBlur radius={0.42} />
      <TiltShift2 blur={0.07} taper={0.55} start={[0, 0.5]} end={[1, 0.5]} />
    </EffectComposer>
  );
}

/**
 * Steps quality down when FPS stays under 45 for 3 seconds (P7). Reads the 1-second samples
 * PerfProbe publishes; never steps back up, to avoid oscillating.
 */
export function QualityGovernor() {
  // PerfProbe replaces window.__perf once per second, so a new object = a new sample.
  const s = useRef<{ lowSeconds: number; sample: unknown }>({ lowSeconds: 0, sample: null });
  const gl = useThree((st) => st.gl);
  useEffect(() => {
    const q = useQuality.getState();
    if (!q.auto) return;
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (SOFTWARE_RENDERER.test(renderer) && q.level < SOFTWARE_START_LEVEL) q.setLevel(SOFTWARE_START_LEVEL);
  }, [gl]);
  useFrame(() => {
    const q = useQuality.getState();
    const perf = window.__perf;
    if (!q.auto || !perf || perf === s.current.sample) return;
    const next = governorStep(q.level, s.current.lowSeconds, q.fakeFps ?? perf.fps);
    s.current = { lowSeconds: next.lowSeconds, sample: perf };
    if (next.level !== q.level) q.setLevel(next.level);
  });
  return null;
}
