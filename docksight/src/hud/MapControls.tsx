import { Home, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

const BUTTONS = [
  { action: 'zoom-in', label: 'Zoom in', Icon: Plus },
  { action: 'zoom-out', label: 'Zoom out', Icon: Minus },
  { action: 'rotate-left', label: 'Rotate left', Icon: RotateCcw },
  { action: 'rotate-right', label: 'Rotate right', Icon: RotateCw },
  { action: 'home', label: 'Reset view', Icon: Home },
] as const;

/** Map controls: vertical column of round buttons on the left edge of the detail panel. Wired to the camera in P2. */
export function MapControls() {
  return (
    <nav
      data-region="map-controls"
      aria-label="Camera"
      className="absolute flex flex-col gap-2"
      style={{ top: 'var(--hud-top)', right: 'calc(var(--hud-detail-w) + var(--hud-gap) * 2)' }}
    >
      {BUTTONS.map(({ action, label, Icon }) => (
        <button
          key={action}
          type="button"
          data-map-action={action}
          aria-label={label}
          className="grid size-10 place-items-center rounded-full border border-white/70 bg-white/88 text-ink shadow-hud backdrop-blur-[16px] hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon size={18} />
        </button>
      ))}
    </nav>
  );
}
