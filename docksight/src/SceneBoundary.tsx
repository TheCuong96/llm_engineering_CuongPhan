import { Component, type ReactNode } from 'react';
import { create } from 'zustand';
import { EmptyState, Panel } from './design/primitives';

/** 'lost' while the GPU has dropped the WebGL context; three.js restores it on 'webglcontextrestored'. */
export const useSceneStatus = create<{ lost: boolean }>(() => ({ lost: false }));

/** Wire context-loss events from the canvas (called from the Canvas onCreated). */
export function watchContext(canvas: HTMLCanvasElement) {
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); // tells the browser we want the context back
    useSceneStatus.setState({ lost: true });
  });
  canvas.addEventListener('webglcontextrestored', () => useSceneStatus.setState({ lost: false }));
}

function SceneMessage({ title, hint, action }: { title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <Panel role="alert" data-scene-error className="pointer-events-auto w-[min(380px,90vw)] p-2">
        <EmptyState title={title} hint={hint}>
          {action}
        </EmptyState>
      </Panel>
    </div>
  );
}

/** Shown over the scene while the context is lost; the sim keeps ticking underneath. */
export function ContextLostNotice() {
  const lost = useSceneStatus((s) => s.lost);
  if (!lost) return null;
  return <SceneMessage title="Reconnecting to the 3D view…" hint="The graphics driver reset. The simulation keeps running and every board still works." />;
}

/**
 * Catches a scene that cannot start (no WebGL, a failed chunk load, a render error) so the
 * HUD stays usable: the fleet board, search and detail panel do not depend on the canvas.
 */
export class SceneBoundary extends Component<{ children: ReactNode }, { error: Error | null; attempt: number }> {
  state = { error: null as Error | null, attempt: 0 };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[DockSight] 3D scene failed:', error);
  }

  render() {
    if (!this.state.error) return <div key={this.state.attempt} className="contents">{this.props.children}</div>;
    return (
      <SceneMessage
        title="3D view unavailable"
        hint="This browser couldn't start WebGL. The fleet board, search and detail panel still work."
        action={
          <button
            type="button"
            data-retry-scene
            onClick={() => this.setState((s) => ({ error: null, attempt: s.attempt + 1 }))}
            className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        }
      />
    );
  }
}
