import { useEffect } from 'react';
import { useCamera } from '../store/camera';
import { useSim } from '../store/sim';
import { useSelection } from '../store/selection';
import { MobileSheet } from './MobileSheet';
import { TopBar } from './TopBar';
import { useIsMobile } from './useIsMobile';
import { KpiBar } from './KpiBar';
import { MapControls } from './MapControls';
import { DetailPanel } from './DetailPanel';
import { OrderTracking } from './OrderTracking';
import { DispatchBoard } from './DispatchBoard';

/** RTS-style four-corner HUD floating above the scene (spec §3). */
export function Hud() {
  const flying = useCamera((s) => s.flying);
  const mobile = useIsMobile();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === 'Escape' && !typing) useSelection.getState().select(null);
      // Space pauses (spec §7.4) — but never steals it from a focused button, tab or field.
      const operable = e.target instanceof HTMLElement && e.target.closest('button, a, input, textarea, select, [role="tab"], [role="menuitem"], [role="option"]');
      if (e.code === 'Space' && !operable) {
        e.preventDefault();
        useSim.getState().clock.togglePause();
        useSim.setState((st) => ({ version: st.version + 1 }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopBar />
      <KpiBar />
      <MapControls />
      {/* Panels fade out during the peak-to-peak flight and reload on landing (spec §5.1). */}
      <div data-hud-fade={flying ? 'out' : 'in'} className={`transition-opacity duration-300 ${flying ? 'opacity-0' : 'opacity-100'}`}>
        {mobile ? (
          <MobileSheet />
        ) : (
          <>
            <DetailPanel />
            <OrderTracking />
            <DispatchBoard />
          </>
        )}
      </div>
    </div>
  );
}
