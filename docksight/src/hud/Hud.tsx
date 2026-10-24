import { TopBar } from './TopBar';
import { KpiBar } from './KpiBar';
import { MapControls } from './MapControls';
import { DetailPanel } from './DetailPanel';
import { ShipmentTracking } from './ShipmentTracking';
import { FleetBoard } from './FleetBoard';

/**
 * Six HUD regions floating over the full-screen scene (spec section 3).
 * The wrapper ignores pointer events so the scene underneath stays draggable;
 * each region opts back in.
 */
export function Hud() {
  return (
    <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">
      <TopBar />
      <KpiBar />
      <MapControls />
      <DetailPanel />
      <ShipmentTracking />
      <FleetBoard />
    </div>
  );
}
