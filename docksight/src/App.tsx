import { lazy, Suspense } from 'react';
import { Hud } from './hud/Hud';

// three.js, R3F and drei load in their own chunk while the HUD shell paints first.
const World = lazy(() => import('./scene/World').then((m) => ({ default: m.World })));

const showPerf = new URLSearchParams(location.search).has('perf');

export function App() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      {/* C. Scene layer, under every HUD region. The ground colour shows until the canvas paints. */}
      <div data-region="scene" className="absolute inset-0 bg-ground">
        <Suspense fallback={null}>
          <World />
        </Suspense>
      </div>
      <Hud />
      {showPerf && (
        <output id="perf-overlay" className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-white" />
      )}
    </main>
  );
}
