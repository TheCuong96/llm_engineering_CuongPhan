import { Home, Minus, Mountain, Plus, RotateCcw, RotateCw, type LucideIcon } from 'lucide-react';
import { vi } from '../i18n/vi';
import { useCamera, type CameraApi } from '../store/camera';

const t = vi.mapControls;
const buttons: { key: string; label: string; icon: LucideIcon; action?: Exclude<keyof CameraApi, 'focus'> }[] = [
  { key: 'zoom-in', label: t.zoomIn, icon: Plus, action: 'zoomIn' },
  { key: 'zoom-out', label: t.zoomOut, icon: Minus, action: 'zoomOut' },
  { key: 'rotate-left', label: t.rotateLeft, icon: RotateCcw, action: 'rotateLeft' },
  { key: 'rotate-right', label: t.rotateRight, icon: RotateCw, action: 'rotateRight' },
  { key: 'reset', label: t.resetView, icon: Home, action: 'reset' },
  { key: 'overview', label: t.sectOverview, icon: Mountain },
];

/** Vertical column hugging the left edge of the detail panel (spec §3, §4.3). */
export function MapControls() {
  const api = useCamera((s) => s.api);
  const mode = useCamera((s) => s.mode);
  const toggleOverview = () => useCamera.getState().setMode(mode === 'overview' ? 'peak' : 'overview');
  return (
    <nav
      data-hud="map-controls"
      aria-label={t.sectOverview}
      className="pointer-events-auto absolute right-[calc(24vw+var(--hud-gap)*2)] top-[calc(var(--hud-top)+var(--hud-gap))] flex flex-col gap-2 max-md:right-2 max-md:top-[calc(var(--hud-top)+96px)] max-md:gap-1.5"
    >
      {buttons.map(({ key, label, icon: Icon, action }, i) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          data-map-action={key}
          aria-pressed={key === 'overview' ? mode === 'overview' : undefined}
          disabled={!api}
          onClick={() => (action ? api?.[action]() : toggleOverview())}
          className={`hud-panel grid size-10 place-items-center !rounded-full max-md:size-9 text-ink hover:text-accent-ink aria-pressed:bg-accent aria-pressed:text-white disabled:opacity-45 disabled:hover:text-ink ${i === 5 ? 'mt-2' : ''}`}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
