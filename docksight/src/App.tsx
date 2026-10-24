import { Hud } from './hud/Hud';

export function App() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      {/* C. Scene layer. P0 stand-in: ground with lavender haze at the edges; the R3F canvas replaces it in P2. */}
      <div
        data-region="scene"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, var(--color-ground) 45%, var(--color-lavender) 130%)' }}
      />
      <Hud />
    </main>
  );
}
