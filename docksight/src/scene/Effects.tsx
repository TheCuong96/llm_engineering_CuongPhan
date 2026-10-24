import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO, TiltShift2 } from '@react-three/postprocessing';
import { useEffect, useRef } from 'react';
import { useCamera } from '../store/camera';
import { effects, governorStep, SOFTWARE_RENDERER, SOFTWARE_START_LEVEL, useQuality } from '../store/quality';

declare global {
  interface Window {
    __quality?: () => { level: number; auto: boolean } & ReturnType<typeof effects>;
  }
}
window.__quality = () => {
  const q = useQuality.getState();
  return { level: q.level, auto: q.auto, ...effects(q.level) };
};

/**
 * Post-processing (spec 5.3, 9): soft AO at the foot of objects, a very light bloom that only
 * catches the brightest whites, and tilt-shift that softens the far (top) edge of the frame.
 * Each goes away at its quality step; the HUD is DOM and never touched.
 */
export function Effects() {
  const level = useQuality((s) => s.level);
  const fx = effects(level);
  if (!fx.post) return null;
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {fx.ao ? <N8AO halfRes aoRadius={3} distanceFalloff={1.2} intensity={1.6} color="#5b6785" /> : <></>}
      <Bloom luminanceThreshold={0.96} luminanceSmoothing={0.04} intensity={0.22} mipmapBlur radius={0.55} />
      <TiltShift2 blur={0.08} taper={0.6} start={[0, 0.42]} end={[1, 0.42]} />
    </EffectComposer>
  );
}

/**
 * Steps quality down when FPS stays under 45 for 3 seconds (P7). Reads the 1-second samples
 * PerfProbe publishes; never steps back up, so it cannot oscillate between two levels.
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
    // A site flight is a transient load, and a step mid-flight recompiles every shader right
    // while the user watches the transition. Ignore those samples; step after landing if needed.
    if (useCamera.getState().flying) {
      s.current.sample = perf;
      return;
    }
    const next = governorStep(q.level, s.current.lowSeconds, q.fakeFps ?? perf.fps);
    s.current = { lowSeconds: next.lowSeconds, sample: perf };
    if (next.level !== q.level) q.setLevel(next.level);
  });
  return null;
}
