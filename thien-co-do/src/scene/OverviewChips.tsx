import { Html } from '@react-three/drei';
import { vi } from '../i18n/vi';
import { fmtInt } from '../hud/format';
import { useSimTick } from '../hud/hooks';
import { fillPct } from '../sim/selectors';
import { useCamera } from '../store/camera';
import { OVERVIEW } from './CameraRig';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';

/** Toàn cảnh tông môn: one chip per peak, "PH-0x · 78%"; clicking flies down to it (spec §4.3). */
export function OverviewChips() {
  const mode = useCamera((s) => s.mode);
  const { world, viewPeakId } = useSimTick();
  if (mode !== 'overview') return null;
  return (
    <>
      {world.peaks.map((p) => (
        <Html key={p.id} position={[p.worldPos[0], p.worldPos[1] + OVERVIEW.chipLift, p.worldPos[2]]} center zIndexRange={[5, 0]}>
          <button
            type="button"
            data-overview-peak={p.id}
            onClick={() => {
              if (p.id !== viewPeakId) {
                useSim.setState({ viewPeakId: p.id });
                useSelection.getState().select(null);
              }
              useCamera.getState().setMode('peak');
            }}
            className={`flex flex-col items-center whitespace-nowrap rounded-full px-3 py-1 text-chip font-medium shadow-md ring-1 ring-accent/20 focus-visible:ring-2 focus-visible:ring-accent ${p.id === viewPeakId ? 'bg-accent text-white' : 'bg-white/95 text-accent-ink hover:bg-accent-tint'}`}
          >
            <span>{vi.scene.label(p.id, `${fmtInt(fillPct(world, p.id))}%`)}</span>
            <span className="font-serif text-[11px] opacity-80">{p.name}</span>
          </button>
        </Html>
      ))}
    </>
  );
}
