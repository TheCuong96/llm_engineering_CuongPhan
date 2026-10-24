import { Home, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
import { useCamera, type CameraApi } from '../store/camera';

const BUTTONS = [
  { action: 'zoom-in', label: 'Zoom in', Icon: Plus, call: (a: CameraApi) => a.zoomIn() },
  { action: 'zoom-out', label: 'Zoom out', Icon: Minus, call: (a: CameraApi) => a.zoomOut() },
  { action: 'rotate-left', label: 'Rotate left', Icon: RotateCcw, call: (a: CameraApi) => a.rotateLeft() },
  { action: 'rotate-right', label: 'Rotate right', Icon: RotateCw, call: (a: CameraApi) => a.rotateRight() },
  { action: 'home', label: 'Reset view', Icon: Home, call: (a: CameraApi) => a.reset() },
] as const;

/** Map controls: vertical column of round buttons on the left edge of the detail panel (spec 4.3). */
export function MapControls() {
  const api = useCamera((s) => s.api);
  return (
    <nav
      data-region="map-controls"
      aria-label="Camera"
      className="absolute flex flex-col gap-2"
      style={{ top: 'var(--hud-top)', right: 'calc(var(--hud-detail-w) + var(--hud-gap) * 2)' }}
    >
      {BUTTONS.map(({ action, label, Icon, call }) => (
        <button
          key={action}
          type="button"
          data-map-action={action}
          aria-label={label}
          title={label}
          disabled={!api}
          onClick={() => api && call(api)}
          className="grid size-10 place-items-center rounded-full border border-white/70 bg-white/88 text-ink shadow-hud backdrop-blur-[16px] hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon size={18} />
        </button>
      ))}
    </nav>
  );
}
