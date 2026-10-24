import { Panel } from '../design/primitives';

const TABS = ['Docks', 'Forklifts', 'Trucks'];

/** F. Fleet board, bottom-right: three tabs, every row clickable. Rows come from sim selectors in P4. */
export function FleetBoard() {
  return (
    <Panel
      data-region="fleet"
      className="absolute flex flex-col gap-3 p-4"
      style={{ right: 'var(--hud-gap)', bottom: 'var(--hud-gap)', width: 'var(--hud-fleet-w)', height: 'var(--hud-fleet-h)' }}
    >
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <span key={tab} className="rounded-full bg-tile px-3 py-1 text-[12.5px] font-medium text-ink-muted">
            {tab}
          </span>
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-10 rounded-tile bg-tile" />
      ))}
    </Panel>
  );
}
