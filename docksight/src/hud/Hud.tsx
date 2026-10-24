import { useEffect } from 'react';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { TopBar } from './TopBar';
import { KpiBar } from './KpiBar';
import { MapControls } from './MapControls';
import { DetailPanel } from './DetailPanel';
import { ShipmentTracking } from './ShipmentTracking';
import { FleetBoard } from './FleetBoard';
import { MOBILE_QUERY, useMediaQuery } from './hooks';
import { MobileSheet } from './MobileSheet';

/** Elements where Space already means something (press, type, toggle). */
function isControl(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.isContentEditable || t.closest('button, a[href], input, textarea, select, [role="tab"], [role="option"], [role="menuitem"]') !== null);
}

/**
 * Six HUD regions floating over the full-screen scene (spec section 3).
 * The wrapper ignores pointer events so the scene underneath stays draggable;
 * each region opts back in.
 */
export function Hud() {
  const mobile = useMediaQuery(MOBILE_QUERY);
  // Esc clears the selection (spec P5); Space pauses / resumes the sim (P7).
  // Inputs and open popovers handle their own Esc first; Space on a focused control presses it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === 'Escape' && !typing && !e.defaultPrevented) useSelection.getState().select(null);
      if (e.key === ' ' && !e.defaultPrevented && !e.repeat && !isControl(e.target)) {
        e.preventDefault();
        useSim.getState().clock.togglePause();
        useSim.setState((s) => ({ version: s.version + 1 }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 *:pointer-events-auto">
      <TopBar />
      <KpiBar />
      {mobile ? (
        // Touch gestures replace the camera buttons; one sheet replaces the three lower/right panels.
        <MobileSheet />
      ) : (
        <>
          <MapControls />
          <DetailPanel />
          <ShipmentTracking />
          <FleetBoard />
        </>
      )}
    </div>
  );
}
