import { Component, type ReactNode } from 'react';
import { create } from 'zustand';
import { Panel } from '../design/Panel';
import { vi } from '../i18n/vi';

export const useSceneStatus = create<{ contextLost: boolean }>(() => ({ contextLost: false }));

/** Message card shown where the 3D scene would be; the HUD around it keeps working. */
export function SceneUnavailable({ reason, onRetry }: { reason: 'webgl' | 'crashed'; onRetry?: () => void }) {
  return (
    <div data-scene-error={reason} className="absolute inset-0 grid place-items-center bg-cloud-low">
      <Panel className="max-w-md p-6 text-center">
        <p className="font-serif text-[18px] font-semibold">{reason === 'webgl' ? vi.errors.webglTitle : vi.errors.crashTitle}</p>
        <p className="mt-2 text-[13px] text-ink-muted">{reason === 'webgl' ? vi.errors.webglBody : vi.errors.crashBody}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {vi.errors.retry}
          </button>
        )}
      </Panel>
    </div>
  );
}

/** Banner while the browser restores a lost WebGL context. */
export function ContextLostBanner() {
  const lost = useSceneStatus((s) => s.contextLost);
  if (!lost) return null;
  return (
    <p role="status" data-context-lost className="hud-panel pointer-events-none absolute left-1/2 top-[calc(var(--hud-top)+var(--hud-gap))] z-20 -translate-x-1/2 px-4 py-2 text-[13px] font-medium">
      {vi.errors.contextLost}
    </p>
  );
}

/** Catches a crash inside the scene so it never takes the HUD down; "Thử lại" remounts it. */
export class SceneBoundary extends Component<{ children: ReactNode }, { error: boolean; attempt: number }> {
  state = { error: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[scene] crashed, HUD stays live:', error);
  }

  render() {
    if (this.state.error) {
      return <SceneUnavailable reason="crashed" onRetry={() => this.setState((s) => ({ error: false, attempt: s.attempt + 1 }))} />;
    }
    return <div key={this.state.attempt} className="absolute inset-0">{this.props.children}</div>;
  }
}
