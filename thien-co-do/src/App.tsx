import { lazy, Suspense, useEffect } from 'react';
import { Hud } from './hud/Hud';
import { GlyphSample } from './hud/GlyphSample';
import { FadeVeil } from './hud/FadeVeil';
import { ContextLostBanner, SceneBoundary } from './hud/SceneStatus';
import { startSimLoop } from './store/simLoop';

// three.js, R3F and drei load in their own chunk while the HUD shell paints first.
const World = lazy(() => import('./scene/World').then((m) => ({ default: m.World })));

const params = new URLSearchParams(location.search);
const showGlyphs = params.has('glyphs');
const showPerf = params.has('perf');

export function App() {
  useEffect(() => startSimLoop(), []);
  return (
    <main className="relative h-full w-full">
      <SceneBoundary>
        <Suspense fallback={null}>
          <World />
        </Suspense>
      </SceneBoundary>
      <FadeVeil />
      <Hud />
      <ContextLostBanner />
      {showGlyphs && <GlyphSample />}
      {showPerf && (
        <output id="perf-overlay" className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-white" />
      )}
    </main>
  );
}
