import { Panel } from '../design/primitives';

const KPIS = ['Stock on hand', 'Trucks on site', 'On-time delivery'];

/** B. Three KPI cards, top-left. Values come from sim selectors in P4. */
export function KpiBar() {
  return (
    <div data-region="kpi" className="absolute flex gap-3" style={{ top: 'var(--hud-top)', left: 'var(--hud-gap)' }}>
      {KPIS.map((label) => (
        <Panel key={label} className="w-[clamp(180px,11.5vw,228px)] p-3.5">
          <div className="text-eyebrow text-ink-muted">{label}</div>
          <div className="mt-2 h-7 w-20 rounded-md bg-tile" />
        </Panel>
      ))}
    </div>
  );
}
